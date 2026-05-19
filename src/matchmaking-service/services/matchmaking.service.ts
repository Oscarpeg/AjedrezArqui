import { MatchmakingPlayer } from '../entities/player.entity';
import { matchmakingRepository } from '../repositories/matchmaking.repository';

export interface MatchResult {
  oponenteEncontrado: boolean;
  tiempoEspera: string | null;
  diferenciaElo: number | null;
  datosOponente: {
    usuarioId: number;
    nombreUsuario: string;
    puntuacionElo: number;
  } | null;
}

export class MatchmakingService {
  public findMatch(player: MatchmakingPlayer): MatchResult {
    matchmakingRepository.addPlayer(player);

    const opponent = matchmakingRepository.findMatchFor(player);
    if (!opponent) {
      return {
        oponenteEncontrado: false,
        tiempoEspera: 'En cola',
        diferenciaElo: null,
        datosOponente: null
      };
    }

    matchmakingRepository.removePlayer(player.usuarioId);
    matchmakingRepository.removePlayer(opponent.usuarioId);

    const diferenciaElo = Math.abs(player.puntuacionElo - opponent.puntuacionElo);
    return {
      oponenteEncontrado: true,
      tiempoEspera: '0 segundos',
      diferenciaElo,
      datosOponente: {
        usuarioId: opponent.usuarioId,
        nombreUsuario: `Jugador${opponent.usuarioId}`,
        puntuacionElo: opponent.puntuacionElo
      }
    };
  }

  public getQueue() {
    return matchmakingRepository.getQueue();
  }
}

export const matchmakingService = new MatchmakingService();
