import { GameEntity, GameMode, Move, Result } from '../entities/game.entity';
import { gamesRepository } from '../repositories/games.repository';
import { startSimulation, stopSimulation } from './simulation.service';

export class GamesService {
  public async createGame(usuarioIdBlanco: number, usuarioIdNegro: number, modo: GameMode, codigoSala?: string): Promise<GameEntity> {
    const game = gamesRepository.create({ usuarioIdBlanco, usuarioIdNegro, modo, codigoSala });
    if (modo === 'ia' || modo === 'blitz') {
      startSimulation(game.partidaId);
    }
    return game;
  }

  public getGameById(partidaId: number): GameEntity | undefined {
    return gamesRepository.findById(partidaId);
  }

  public getActiveGamesByUser(usuarioId: number): GameEntity[] {
    return gamesRepository.findByUser(usuarioId, 'activa');
  }

  public stopGameSimulation(partidaId: number): boolean {
    return stopSimulation(partidaId);
  }
}

export const gamesService = new GamesService();
