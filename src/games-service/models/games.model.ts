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

export interface Game {
  partidaId: number;
  jugadores: Player[];
  estado: 'esperando' | 'activa' | 'finalizada';
  turno: 'blanco' | 'negro';
  movimientos: Move[];
  modoSimulacion: boolean;
  intervaloSimulacion: any;
  resultado: Result | null;
  fechaCreacion: Date;
  fechaFinalizacion?: Date;
}

class GamesModel {
  private games: Game[] = [];
  private idCounter = 1;

  public create(gameData: { usuarioIdBlanco: number; usuarioIdNegro: number }): Game {
    const game: Game = {
      partidaId: this.idCounter++,
      jugadores: [
        { usuarioId: gameData.usuarioIdBlanco, color: 'blanco', tiempoRestante: 600 },
        { usuarioId: gameData.usuarioIdNegro, color: 'negro', tiempoRestante: 600 }
      ],
      estado: 'activa',
      turno: 'blanco',
      movimientos: [],
      modoSimulacion: true,
      intervaloSimulacion: null,
      resultado: null,
      fechaCreacion: new Date()
    };
    this.games.push(game);
    return game;
  }

  public findById(id: number): Game | undefined {
    return this.games.find(g => g.partidaId === id);
  }

  public findByUser(usuarioId: number, estado?: 'esperando' | 'activa' | 'finalizada'): Game[] {
    return this.games.filter(g => 
      g.jugadores.some(p => p.usuarioId === usuarioId) &&
      (!estado || g.estado === estado)
    );
  }

  public update(id: number, updateData: Partial<Game>): Game | null {
    const game = this.findById(id);
    if (!game) return null;
    Object.assign(game, updateData);
    return game;
  }

  public addMoveToGame(gameId: number, moveData: Move): Game | null {
    const game = this.findById(gameId);
    if (!game) return null;
    game.movimientos.push(moveData);
    game.turno = moveData.color === 'blanco' ? 'negro' : 'blanco';
    return game;
  }

  public finishGame(gameId: number, resultData: Result): Game | null {
    return this.update(gameId, {
      estado: 'finalizada',
      resultado: resultData,
      fechaFinalizacion: new Date()
    });
  }
}

export const gamesModel = new GamesModel();
