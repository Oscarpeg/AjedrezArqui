import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import type { PieceType, GameMode } from "../models/types";
import { storageModel } from "../models/storageModel";

const pieceMap: Record<string, PieceType> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔'
};

const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];

const getColLetter = (col: number) => String.fromCharCode(97 + col);

const buildBoardFromChess = (chess: Chess): PieceType[][] => {
  return chess.board().map((row) =>
    row.map((cell) => {
      if (!cell) return null;
      return pieceMap[cell.color === 'w' ? cell.type.toUpperCase() : cell.type];
    })
  );
};

export function useChessGameController(
  playerName: string,
  playerId: number,
  gameId: number,
  gameMode: GameMode,
  onBack: () => void,
  preferredColor: 'white' | 'black' | 'random' = 'white',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
  const chessRef = useRef(new Chess());
  const [board, setBoard] = useState<PieceType[][]>(buildBoardFromChess(chessRef.current));
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [whiteTime, setWhiteTime] = useState(gameMode === 'fast' ? 300 : 600);
  const [blackTime, setBlackTime] = useState(gameMode === 'fast' ? 300 : 600);
  const [moves, setMoves] = useState<string[]>([]);
  const [whiteCaptures, setWhiteCaptures] = useState<PieceType[]>([]);
  const [blackCaptures, setBlackCaptures] = useState<PieceType[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [multiplayerStatus, setMultiplayerStatus] = useState('');
  const [isMultiplayerConnected, setIsMultiplayerConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>(() => {
    if (preferredColor === 'random') return Math.random() < 0.5 ? 'white' : 'black';
    return preferredColor;
  });
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<string[]>([]);
  const [kingInCheck, setKingInCheck] = useState<{ row: number; col: number } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const heartbeatTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameMode === 'multiplayer') return;
      if (currentTurn === 'white') setWhiteTime((t) => Math.max(0, t - 1));
      else setBlackTime((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTurn, gameMode]);

  useEffect(() => {
    const chess = chessRef.current;
    setBoard(buildBoardFromChess(chess));
    setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black');
    setMoves(chess.history().map((m, idx) => `${idx + 1}. ${m}`));

    // If it's AI turn at start, move
    if (gameMode === 'fast' || gameMode === 'standard') {
      handleStartVsAI();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (heartbeatIntervalRef.current) {
        window.clearInterval(heartbeatIntervalRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        window.clearTimeout(heartbeatTimeoutRef.current);
      }
    };
  }, []);

  const clearHeartbeatTimers = () => {
    if (heartbeatIntervalRef.current) {
      window.clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      window.clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  };
  // Si en 30s no recibimos respuesta al heartbeat, asumimos conexión muerta.
  // Cerramos el socket para que el usuario pueda reconectar.
  const scheduleHeartbeatTimeout = () => {
    if (heartbeatTimeoutRef.current) {
      window.clearTimeout(heartbeatTimeoutRef.current);
    }
    heartbeatTimeoutRef.current = window.setTimeout(() => {
      setMultiplayerStatus('Multiplayer heartbeat fallido. Reconectando...');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearHeartbeatTimers();
    }, 30000);
  };

  const saveToHistoryAndExit = (reason: string) => {
    if (moves.length > 0) {
      storageModel.saveGameToHistory({
        id: gameId,
        date: new Date().toISOString(),
        playerName,
        movesCount: moves.length,
        whiteCaptures: whiteCaptures.length,
        blackCaptures: blackCaptures.length,
        reason
      });
    }
    onBack();
  };

  const syncFromChess = () => {
    const chess = chessRef.current;
    setBoard(buildBoardFromChess(chess));
    setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black');
    setMoves(chess.history().map((m, idx) => `${idx + 1}. ${m}`));
    
    // Detectar jaque
    if (chess.isCheck()) {
      const turn = chess.turn();
      let kingPos = { row: -1, col: -1 };
      chess.board().forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell && cell.type === 'k' && cell.color === turn) {
            kingPos = { row: r, col: c };
          }
        });
      });
      setKingInCheck(kingPos);
    } else {
      setKingInCheck(null);
    }
  };

  const handleStartVsAI = () => {
    const ws = openWebSocket();
    const payload = { 
      action: 'startVsAI', 
      payload: { 
        usuarioId: playerId, 
        playerColor: preferredColor, 
        difficulty 
      } 
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify(payload));
      });
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode === 'multiplayer' && !roomCode) {
      setMultiplayerStatus('Crea o únete a una sala antes de mover.');
      return;
    }

    const square = `${getColLetter(col)}${8 - row}`;
    const piece = board[row][col];

    if (!selectedSquare) {
      if (piece) {
        const isWhitePiece = whitePieces.includes(piece);
        const isPlayerPiece = playerColor === 'white' ? isWhitePiece : !isWhitePiece;
        if (
          (currentTurn === 'white' && isPlayerPiece && playerColor === 'white') ||
          (currentTurn === 'black' && isPlayerPiece && playerColor === 'black')
        ) {
          setSelectedSquare({ row, col });
          // Calcular movimientos legales para resaltar
          const legal = chessRef.current.moves({ square: square as any, verbose: true });
          setLegalMovesForSelected(legal.map(m => m.to));
        }
      }
      return;
    }

    if (selectedSquare.row === row && selectedSquare.col === col) {
      setSelectedSquare(null);
      return;
    }

    const from = `${getColLetter(selectedSquare.col)}${8 - selectedSquare.row}`;
    const to = square;
    const moveResult = chessRef.current.move({ from, to, promotion: 'q' });

    if (!moveResult) {
      setSelectedSquare(null);
      setLegalMovesForSelected([]);
      return;
    }

    syncFromChess();
    setSelectedSquare(null);
    setLegalMovesForSelected([]);

    if (moveResult.captured) {
      const capturedPiece = pieceMap[moveResult.captured.toUpperCase()];
      if (moveResult.color === 'w') setWhiteCaptures((prev) => [...prev, capturedPiece]);
      else setBlackCaptures((prev) => [...prev, capturedPiece]);
    }

    if (gameMode === 'multiplayer' || gameMode === 'fast' || gameMode === 'standard') {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'move', payload: { from, to } }));
      }
    }
  };

  const handleRestart = () => {
    chessRef.current.reset();
    setBoard(buildBoardFromChess(chessRef.current));
    setCurrentTurn('white');
    setMoves([]);
    setWhiteCaptures([]);
    setBlackCaptures([]);
    setSelectedSquare(null);
    setWhiteTime(gameMode === 'fast' ? 180 : 600);
    setBlackTime(gameMode === 'fast' ? 180 : 600);
    setRoomCode('');
    setRoomCodeInput('');
    setMultiplayerStatus('');
    setOpponentName(null);
    const newColor = preferredColor === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : preferredColor;
    setPlayerColor(newColor);
    
    // If it's AI turn at restart, move
    if (gameMode === 'fast' || gameMode === 'standard') {
       handleStartVsAI();
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    clearHeartbeatTimers();
  };

  const openWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    console.log('Opening WebSocket connection to ws://localhost:3004/ws');
    const ws = new WebSocket('ws://localhost:3004/ws');
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      console.log('WebSocket connection opened');
      setMultiplayerStatus('Conectado al servidor multiplayer');
      setIsMultiplayerConnected(true);
      clearHeartbeatTimers();
      ws.send(JSON.stringify({ action: 'heartbeat' }));

      // Capa 2 de keepalive: heartbeat a nivel de aplicación.
      // Necesario porque algunos proxies/load balancers no transmiten los pings
      // binarios del protocolo WS. Este heartbeat viaja como JSON normal.
      heartbeatIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'heartbeat' }));
        }
      }, 15000);// Cada 15s — más frecuente que el ping del servidor (30s)
      scheduleHeartbeatTimeout();
    });

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        if (message.type === 'heartbeat') {
          console.log('Received heartbeat from server');
          scheduleHeartbeatTimeout();
          return;
        }
        if (message.type === 'roomCreated') {
          setRoomCode(message.payload.code);
          setOpponentName(null);
          setMultiplayerStatus('Sala creada, comparte el código. Esperando oponente...');
          return;
        }
        if (message.type === 'roomJoined') {
          setRoomCode(message.payload.code);
          const color = message.payload.color || 'black';
          setPlayerColor(color);
          if (message.payload.otherPlayers && message.payload.otherPlayers.length > 0) {
            setOpponentName(message.payload.otherPlayers[0].nombre);
            setMultiplayerStatus(`Te uniste a la sala. Jugando como ${color === 'white' ? 'Blancas' : 'Negras'} contra ${message.payload.otherPlayers[0].nombre}`);
          } else {
            setMultiplayerStatus(`Te uniste a la sala. Jugando como ${color === 'white' ? 'Blancas' : 'Negras'}. Esperando oponente...`);
          }
          return;
        }
        if (message.type === 'gameStarted') {
          const { color, opponentName } = message.payload;
          setPlayerColor(color);
          setOpponentName(opponentName);
          setMultiplayerStatus(`¡Partida iniciada! Juegas como ${color === 'white' ? 'Blancas' : 'Negras'} contra ${opponentName}`);
          return;
        }
        if (message.type === 'playerJoined') {
          const playerName = message.payload.nombre;
          setOpponentName(playerName);
          setMultiplayerStatus(`Se unió ${playerName} a la sala. ¡Partida iniciada!`);
          return;
        }
        if (message.type === 'opponentMove' || message.type === 'aiMove') {
          const { from, to } = message.payload;
          const moveResult = chessRef.current.move({ from, to, promotion: 'q' });
          syncFromChess();
          
          if (moveResult && moveResult.captured) {
            const capturedPiece = pieceMap[moveResult.captured.toUpperCase()];
            if (moveResult.color === 'w') setWhiteCaptures((prev) => [...prev, capturedPiece]);
            else setBlackCaptures((prev) => [...prev, capturedPiece]);
          }
          return;
        }
        if (message.type === 'aiGameStarted') {
          const { color, roomCode: newRoomCode } = message.payload;
          setPlayerColor(color);
          setRoomCode(newRoomCode);
          setOpponentName(`IA (${difficulty})`);
          setMultiplayerStatus(`Partida contra IA iniciada. Juegas como ${color === 'white' ? 'Blancas' : 'Negras'}.`);
          return;
        }
        if (message.type === 'error') {
          setMultiplayerStatus(message.payload);
          return;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setMultiplayerStatus('Conexión multiplayer cerrada.');
      setIsMultiplayerConnected(false);
      clearHeartbeatTimers();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMultiplayerStatus('Error de conexión multiplayer.');
      setIsMultiplayerConnected(false);
      clearHeartbeatTimers();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return ws;
  };

  const handleCreateRoom = async () => {
    console.log('handleCreateRoom called with playerId:', playerId, 'playerName:', playerName);
    const ws = openWebSocket();
    const payload = { action: 'createRoom', payload: { usuarioId: playerId, nombre: playerName } };
    console.log('Sending createRoom payload:', payload);

    if (ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket is open, sending message immediately');
      ws.send(JSON.stringify(payload));
    } else {
      console.log('WebSocket not open, waiting for open event. Current state:', ws.readyState);
      ws.addEventListener('open', () => {
        console.log('WebSocket opened, now sending message');
        ws.send(JSON.stringify(payload));
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      setMultiplayerStatus('Ingresa el código de sala para unirte.');
      return;
    }
    const ws = openWebSocket();
    const payload = {
      action: 'joinRoom',
      payload: { code: roomCodeInput.trim(), usuarioId: playerId, nombre: playerName }
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify(payload));
      });
    }
  };

  const handleCopyRoomCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setMultiplayerStatus('Código copiado al portapapeles.');
    } catch {
      setMultiplayerStatus('No se pudo copiar el código. Cópialo manualmente.');
    }
  };

  return {
    state: {
      board,
      currentTurn,
      whiteTime,
      blackTime,
      moves,
      whiteCaptures,
      blackCaptures,
      selectedSquare,
      roomCodeInput,
      roomCode,
      multiplayerStatus,
      isMultiplayerConnected,
      opponentName,
      playerColor,
      legalMovesForSelected,
      kingInCheck
    },
    actions: {
      handleSquareClick,
      handleRestart,
      handleSurrender: () => saveToHistoryAndExit("Rendición"),
      handleVolver: () => saveToHistoryAndExit("Abandonada"),
      setRoomCodeInput,
      handleCreateRoom,
      handleJoinRoom,
      handleCopyRoomCode
    }
  };
}
