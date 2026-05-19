import WebSocket from 'ws';
import { MultiplayerRoomEntity } from '../entities/multiplayerRoom.entity';
import { gamesRepository } from '../repositories/games.repository';

interface PlayerMeta {
  socket: WebSocket;
  roomCode: string;
  usuarioId: number;
  nombre: string;
}

const clients = new Map<WebSocket, PlayerMeta>();

export const createRoom = (usuarioId: number, nombre: string): MultiplayerRoomEntity => {
  return gamesRepository.createRoom(usuarioId, nombre);
};

export const joinRoom = (code: string, usuarioId: number, nombre: string): MultiplayerRoomEntity | null => {
  return gamesRepository.addPlayerToRoom(code, usuarioId, nombre);
};

export const registerSocket = (socket: WebSocket, roomCode: string, usuarioId: number, nombre: string): void => {
  clients.set(socket, { socket, roomCode, usuarioId, nombre });
};

export const unregisterSocket = (socket: WebSocket): void => {
  clients.delete(socket);
};

export const getPlayersInRoom = (roomCode: string): PlayerMeta[] => {
  return Array.from(clients.values()).filter(c => c.roomCode === roomCode);
};

export const broadcastToRoom = (roomCode: string, message: any, excludeSocket?: WebSocket): void => {
  for (const client of getPlayersInRoom(roomCode)) {
    if (client.socket.readyState === WebSocket.OPEN && client.socket !== excludeSocket) {
      client.socket.send(JSON.stringify(message));
    }
  }
};

export const getClientMeta = (socket: WebSocket): PlayerMeta | undefined => {
  return clients.get(socket);
};
