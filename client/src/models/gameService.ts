import type { CreateRoomResponse, JoinRoomResponse, GameMode } from './entities/game.entity';

const API_BASE = 'http://localhost:3004/games';

export const gameService = {
  async createMultiplayerRoom(usuarioId: number, nombre: string): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_BASE}/multiplayer/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, nombre })
    });
    if (!response.ok) {
      throw new Error('No se pudo crear la sala multiplayer');
    }
    return response.json();
  },

  async joinMultiplayerRoom(code: string, usuarioId: number, nombre: string): Promise<JoinRoomResponse> {
    const response = await fetch(`${API_BASE}/multiplayer/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, usuarioId, nombre })
    });
    if (!response.ok) {
      throw new Error('No se pudo unir a la sala multiplayer');
    }
    return response.json();
  },

  getApiBase: (): string => API_BASE
};
