export type GameStatus = 'esperando' | 'activa' | 'finalizada';
export type GameMode = 'ia' | 'blitz' | 'multiplayer' | 'normal';

export interface Player {
  usuarioId: number;
  color: 'blanco' | 'negro';
  tiempoRestante: number;
}

export interface Move {
  jugadorId: number;
  color: 'blanco' | 'negro';
  origen: string;
  destino: string;
  timestamp: Date;
}

export interface Result {
  ganadorId: number | null;
  razon: string;
}

export interface GameEntity {
  partidaId: number;
  jugadores: Player[];
  estado: GameStatus;
  turno: 'blanco' | 'negro';
  movimientos: Move[];
  modoSimulacion: boolean;
  intervaloSimulacion: NodeJS.Timeout | null;
  resultado: Result | null;
  fechaCreacion: Date;
  fechaFinalizacion?: Date;
  modo: GameMode;
  codigoSala?: string;
}
