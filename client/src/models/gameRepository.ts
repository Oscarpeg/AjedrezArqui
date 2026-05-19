import type { GameMode } from './entities/game.entity';

const STORAGE_KEY = 'ajedrez_last_game_mode';

export const gameRepository = {
  saveLastGameMode: (mode: GameMode): void => {
    localStorage.setItem(STORAGE_KEY, mode);
  },
  getLastGameMode: (): GameMode => {
    const saved = localStorage.getItem(STORAGE_KEY) as GameMode | null;
    return saved || 'standard';
  }
};
