import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import gamesRoutes from './routes/games.routes';
import multiplayerRoutes from './routes/multiplayer.routes';
import {
  createRoom,
  joinRoom,
  registerSocket,
  unregisterSocket,
  broadcastToRoom,
  getClientMeta,
  getPlayersInRoom
} from './services/multiplayer.service';
import { GameManagerService } from './services/gameManager.service';
import { EloService } from './services/elo.service';
import { AIService, Difficulty } from './services/ai.service';
import { PrismaClient } from '@prisma/client';

const aiGamesMeta = new Map<string, { difficulty: Difficulty, playerColor: 'white' | 'black' }>();
const authClients = new Map<string, WebSocket>(); // Tracks PCs waiting for QR auth

const prisma = new PrismaClient();

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

app.use('/games', gamesRoutes);
app.use('/games/multiplayer', multiplayerRoutes);

// Internal Notification Endpoint for Auth Service
app.post('/internal/auth-notify', (req, res) => {
  const { sessionId, tokenJwt, user } = req.body;
  console.log(`Received auth notification for session: ${sessionId}`);

  const socket = authClients.get(sessionId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'login_success',
      payload: {
        tokenJwt,
        usuarioId: user.usuarioId,
        nombreUsuario: user.nombreUsuario
      }
    }));
    authClients.delete(sessionId); // Clean up
    res.json({ success: true });
  } else {
    console.warn(`No active socket found for session: ${sessionId}`);
    res.status(404).json({ error: 'No active socket for this session' });
  }
});

// Endpoint de prueba para verificar conectividad
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Games service is running', timestamp: new Date().toISOString() });
});


// WebSocket NO crea su propio servidor, se monta ENCIMA del HTTP existente.
// Ambos escuchan en el mismo puerto (3004) pero en paths distintos:
// HTTP  → localhost:3004/games, /test, etc.
// WS    → localhost:3004/ws
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

console.log('WebSocket server configured with path: /ws');

wss.on('connection', (socket: WebSocket) => {
  console.log('New WebSocket connection established');
  // Capa 1 de keepalive: ping-pong nativo del protocolo WebSocket.
  // El browser responde el pong automáticamente sin código extra en el front.
  (socket as any).isAlive = true;
  // Si llega pong, el cliente sigue vivo. Reactivamos la bandera.
  socket.on('pong', () => {
    (socket as any).isAlive = true;
    console.log('Received pong from client');
  });

  socket.on('error', (error) => {
    console.error('WebSocket socket error:', error);
  });

  socket.on('message', async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      const { action, payload } = data;


      //CREAR SALA, UNIRSE A SALA, HACER MOVIMIENTO
      if (action === 'createRoom') {
        console.log('Creating room for user:', payload);
        const room = createRoom(Number(payload.usuarioId), String(payload.nombre));// Crea la sala en memoria
        console.log('Room created:', room);
        registerSocket(socket, room.code, Number(payload.usuarioId), String(payload.nombre));// Asocia ESTE socket a esa sala
        // A partir de aquí el servidor sabe: "este socket pertenece a sala XYZ", y se genera el codigo
        socket.send(JSON.stringify({ type: 'roomCreated', payload: { code: room.code, roomId: room.roomId } }));
      }

      if (action === 'joinRoom') {
        const room = joinRoom(String(payload.code), Number(payload.usuarioId), String(payload.nombre));
        if (!room) {
          socket.send(JSON.stringify({ type: 'error', payload: 'Sala no encontrada o ya completa' }));
          return;
        }
        registerSocket(socket, room.code, Number(payload.usuarioId), String(payload.nombre));
        
        // Si la sala está completa (2 jugadores), asignamos colores aleatorios
        if (room.jugadores.length === 2) {
          const hostIsWhite = Math.random() < 0.5;
          const hostColor = hostIsWhite ? 'white' : 'black';
          const joinerColor = hostIsWhite ? 'black' : 'white';
          
          // Guardamos los colores en la entidad de la sala (opcional pero consistente)
          room.jugadores.find(p => p.usuarioId === room.host.usuarioId)!.color = hostColor;
          room.jugadores.find(p => p.usuarioId === Number(payload.usuarioId))!.color = joinerColor;

          // Notificar al que se une
          socket.send(JSON.stringify({ 
            type: 'roomJoined', 
            payload: { 
              code: room.code, 
              roomId: room.roomId, 
              color: joinerColor,
              otherPlayers: [{ usuarioId: room.host.usuarioId, nombre: room.host.nombre }] 
            } 
          }));

          // Notificar al host que la partida inicia y qué color le tocó
          broadcastToRoom(room.code, { 
            type: 'gameStarted', 
            payload: { 
              color: hostColor, 
              opponentName: payload.nombre 
            } 
          }, socket);
        } else {
          // Caso borde: sala con 1 solo jugador (el que se une es el primero? no debería pasar con joinRoom)
          socket.send(JSON.stringify({ type: 'roomJoined', payload: { code: room.code, roomId: room.roomId, otherPlayers: [] } }));
          broadcastToRoom(room.code, { type: 'playerJoined', payload: { usuarioId: payload.usuarioId, nombre: payload.nombre } }, socket);
        }
      }

      if (action === 'startVsAI') {
        const { playerColor, difficulty, usuarioId } = payload;
        const color = playerColor === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : playerColor;
        const roomCode = `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        registerSocket(socket, roomCode, Number(usuarioId), 'Jugador');
        aiGamesMeta.set(roomCode, { difficulty, playerColor: color });

        socket.send(JSON.stringify({ 
          type: 'aiGameStarted', 
          payload: { roomCode, color, difficulty } 
        }));

        if (color === 'black') {
          // AI es blanco, mueve primero
          const game = GameManagerService.getGame(roomCode);
          const aiMove = AIService.getBestMove(game, difficulty);
          game.move(aiMove);
          socket.send(JSON.stringify({
            type: 'aiMove',
            payload: {
              from: aiMove.from,
              to: aiMove.to,
              san: aiMove.san,
              fen: game.fen()
            }
          }));
        }
      }

      if (action === 'move') {
        const meta = getClientMeta(socket);
        if (!meta) {
          socket.send(JSON.stringify({ type: 'error', payload: 'No estás en una sala' }));
          return;
        }

        const moveResult = GameManagerService.validateMove(meta.roomCode, payload);
        if (moveResult.valid) {
          // Movimiento válido, retransmitir
          broadcastToRoom(meta.roomCode, { 
            type: 'opponentMove', 
            payload: payload,
            fen: moveResult.fen,
            isGameOver: moveResult.isGameOver 
          }, socket);

          // Si es partida contra IA y no ha terminado
          const aiMeta = aiGamesMeta.get(meta.roomCode);
          if (aiMeta && !moveResult.isGameOver) {
            setTimeout(() => {
              const game = GameManagerService.getGame(meta.roomCode);
              const aiMove = AIService.getBestMove(game, aiMeta.difficulty);
              const aiMoveResult = GameManagerService.validateMove(meta.roomCode, { from: aiMove.from, to: aiMove.to, promotion: 'q' });
              
              socket.send(JSON.stringify({
                type: 'aiMove',
                payload: {
                  from: aiMove.from,
                  to: aiMove.to,
                  san: aiMove.san,
                  fen: aiMoveResult.fen,
                  isGameOver: aiMoveResult.isGameOver,
                  winner: aiMoveResult.winner
                }
              }));

              if (aiMoveResult.isGameOver) {
                 aiGamesMeta.delete(meta.roomCode);
                 GameManagerService.removeGame(meta.roomCode);
              }
            }, 500); // Pequeño delay para realismo
          }

          if (moveResult.isGameOver) {
            console.log('Game over detected in room:', meta.roomCode);
            const playersInRoom = getPlayersInRoom(meta.roomCode);
            
            if (playersInRoom.length >= 2) {
              const p1 = playersInRoom[0];
              const p2 = playersInRoom[1];
              
              const user1 = await prisma.user.findUnique({ where: { usuarioId: p1.usuarioId } });
              const user2 = await prisma.user.findUnique({ where: { usuarioId: p2.usuarioId } });
              
              if (user1 && user2) {
                // Asumimos que p1 es blanco y p2 es negro por ahora o según la lógica de la sala
                const result = moveResult.winner === 'white' ? 1 : (moveResult.winner === 'black' ? 0 : 0.5);
                const [newElo1, newElo2] = EloService.calculateNewElo(user1.elo, user2.elo, result);
                
                await prisma.user.update({ where: { usuarioId: user1.usuarioId }, data: { elo: newElo1 } });
                await prisma.user.update({ where: { usuarioId: user2.usuarioId }, data: { elo: newElo2 } });
                
                broadcastToRoom(meta.roomCode, { 
                  type: 'eloUpdate', 
                  payload: { 
                    [user1.nombreUsuario]: newElo1, 
                    [user2.nombreUsuario]: newElo2 
                  } 
                });
              }
            }

            broadcastToRoom(meta.roomCode, { type: 'gameOver', payload: { winner: moveResult.winner } });
            GameManagerService.removeGame(meta.roomCode);
          }
        } else {
          socket.send(JSON.stringify({ type: 'invalid_move', payload: 'Movimiento ilegal o formato inválido' }));
        }
      }

      if (action === 'subscribeAuth') {
        const { sessionId } = payload;
        console.log(`Socket subscribing to auth session: ${sessionId}`);
        authClients.set(sessionId, socket);
      }

      if (action === 'heartbeat') {
        socket.send(JSON.stringify({ type: 'heartbeat', payload: 'alive' }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      socket.send(JSON.stringify({ type: 'error', payload: 'Formato de mensaje inválido' }));
    }
  });

  socket.on('close', (code, reason) => {
    console.log('WebSocket closed', { code, reason: reason.toString() });
    unregisterSocket(socket);
    // Clean up auth subscriptions
    for (const [sid, s] of authClients.entries()) {
      if (s === socket) {
        authClients.delete(sid);
        break;
      }
    }
  });
});

// Cada 30s revisamos todos los clientes conectados.
// Si isAlive sigue en false (no respondió el pong anterior), lo terminamos.
// Si está vivo, lo ponemos en false y mandamos nuevo ping — esperamos su pong.
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((client: WebSocket) => {
    const ws = client as any;
    if (ws.isAlive === false) {
      client.terminate();// No respondió: conexión nula, la matamos
      return;
    }
    ws.isAlive = false;// Asumimos muerto hasta que llegue el pong
    client.ping();
  });
}, 30000);
// Un solo puerto sirve los dos protocolos. El servidor detecta
// por el header "Upgrade: websocket" si es HTTP o WS.
server.listen(PORT, () => {
  console.log(`Games Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  clearInterval(heartbeatInterval);
  server.close();
});
