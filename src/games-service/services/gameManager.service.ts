import { Chess } from 'chess.js';

export class GameManagerService {
  private static activeGames = new Map<string, Chess>();

  public static getGame(roomCode: string): Chess {
    if (!this.activeGames.has(roomCode)) {
      this.activeGames.set(roomCode, new Chess());
    }
    return this.activeGames.get(roomCode)!;
  }

  public static removeGame(roomCode: string): void {
    this.activeGames.delete(roomCode);
  }

  public static validateMove(roomCode: string, move: any): { valid: boolean; fen?: string; isGameOver?: boolean; winner?: string } {
    const game = this.getGame(roomCode);
    try {
      const result = game.move(move);
      if (result) {
        let winner = undefined;
        if (game.isCheckmate()) {
          winner = game.turn() === 'w' ? 'black' : 'white';
        }
        return { 
          valid: true, 
          fen: game.fen(), 
          isGameOver: game.isGameOver(),
          winner
        };
      }
    } catch (e) {
      // Invalid move format or illegal move
    }
    return { valid: false };
  }
}
