export type GameMode = 'standard' | 'fast' | 'multiplayer';

export interface MultiplayerRoom {
  code: string;
  roomId: number;
  hostId: number;
  hostName: string;
}

export interface CreateRoomResponse {
  code: string;
  roomId: number;
}

export interface JoinRoomResponse {
  code: string;
  roomId: number;
  jugador: {
    usuarioId: number;
    nombre: string;
  };
}
