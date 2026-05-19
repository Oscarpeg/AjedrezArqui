import type { GameRecord, PlayerData } from "./types";

export const storageModel = {
  getUser: (): PlayerData | null => {
    const saved = localStorage.getItem("ajedrez_user");
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      return { id: Math.floor(Date.now() / 1000), name: data.name, email: data.email };
    } catch {
      return null;
    }
  },
  
  saveUser: (name: string, email?: string): void => {
    localStorage.setItem("ajedrez_user", JSON.stringify({ name, email }));
  },
  
  getHistory: (): GameRecord[] => {
    const saved = localStorage.getItem("ajedrez_history");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
  
  saveGameToHistory: (record: GameRecord): void => {
    const history = storageModel.getHistory();
    localStorage.setItem("ajedrez_history", JSON.stringify([record, ...history]));
  }
};
