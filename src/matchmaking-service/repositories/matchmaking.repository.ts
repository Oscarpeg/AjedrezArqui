import { MatchmakingPlayer } from '../entities/player.entity';

export class MatchmakingRepository {
  private queue: MatchmakingPlayer[] = [];

  public addPlayer(player: MatchmakingPlayer): void {
    const exists = this.queue.some(item => item.usuarioId === player.usuarioId);
    if (!exists) {
      this.queue.push(player);
    }
  }

  public removePlayer(usuarioId: number): void {
    this.queue = this.queue.filter(item => item.usuarioId !== usuarioId);
  }

  public findMatchFor(player: MatchmakingPlayer): MatchmakingPlayer | null {
    const candidates = this.queue.filter(item => item.usuarioId !== player.usuarioId);
    if (candidates.length === 0) {
      return null;
    }

    const best = candidates.reduce((mejor, actual) => {
      const difMejor = Math.abs(mejor.puntuacionElo - player.puntuacionElo);
      const difActual = Math.abs(actual.puntuacionElo - player.puntuacionElo);
      return difActual < difMejor ? actual : mejor;
    });

    return best;
  }

  public getQueue(): MatchmakingPlayer[] {
    return [...this.queue];
  }
}

export const matchmakingRepository = new MatchmakingRepository();
