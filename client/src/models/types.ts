export type Page = "menu" | "register" | "login" | "game" | "history";
export type GameMode = 'standard' | 'fast' | 'multiplayer';

export type PieceType = '♔' | '♕' | '♖' | '♗' | '♘' | '♙' | '♚' | '♛' | '♜' | '♝' | '♞' | '♟' | null;

export interface PlayerData {
  id: number;
  name: string;
  email?: string;
}

export interface GameRecord {
  id: number;
  date: string;
  playerName: string;
  movesCount: number;
  whiteCaptures: number;
  blackCaptures: number;
  reason: string;
}
