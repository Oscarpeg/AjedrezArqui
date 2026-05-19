import { GameEntity, GameMode, Move, Result } from '../entities/game.entity';
import { MultiplayerRoomEntity } from '../entities/multiplayerRoom.entity';

export class GamesRepository {
  private games: GameEntity[] = [];
  private rooms: MultiplayerRoomEntity[] = [];
  private idCounter = 1;
  private roomIdCounter = 1000;

  public create(gameData: { usuarioIdBlanco: number; usuarioIdNegro: number; modo: GameMode; codigoSala?: string }): GameEntity {
    const game: GameEntity = {
      partidaId: this.idCounter++,
      jugadores: [
        { usuarioId: gameData.usuarioIdBlanco, color: 'blanco', tiempoRestante: 600 },
        { usuarioId: gameData.usuarioIdNegro, color: 'negro', tiempoRestante: 600 }
      ],
      estado: 'activa',
      turno: 'blanco',
      movimientos: [],
      modoSimulacion: gameData.modo !== 'multiplayer',
      intervaloSimulacion: null,
      resultado: null,
      fechaCreacion: new Date(),
      modo: gameData.modo,
      codigoSala: gameData.codigoSala
    };

    this.games.push(game);
    return game;
  }

  public findById(id: number): GameEntity | undefined {
    return this.games.find(g => g.partidaId === id);
  }

  public findByUser(usuarioId: number, estado?: GameEntity['estado']): GameEntity[] {
    return this.games.filter(g =>
      g.jugadores.some(p => p.usuarioId === usuarioId) &&
      (!estado || g.estado === estado)
    );
  }

  public update(id: number, updateData: Partial<GameEntity>): GameEntity | null {
    const game = this.findById(id);
    if (!game) return null;
    Object.assign(game, updateData);
    return game;
  }

  public addMoveToGame(gameId: number, moveData: Move): GameEntity | null {
    const game = this.findById(gameId);
    if (!game) return null;
    game.movimientos.push(moveData);
    game.turno = moveData.color === 'blanco' ? 'negro' : 'blanco';
    return game;
  }

  public finishGame(gameId: number, resultData: Result): GameEntity | null {
    return this.update(gameId, {
      estado: 'finalizada',
      resultado: resultData,
      fechaFinalizacion: new Date()
    });
  }

  public createRoom(hostUsuarioId: number, hostNombre: string): MultiplayerRoomEntity {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: MultiplayerRoomEntity = {
      roomId: this.roomIdCounter++,
      code,
      host: { usuarioId: hostUsuarioId, nombre: hostNombre },
      jugadores: [{ usuarioId: hostUsuarioId, nombre: hostNombre }],
      estado: 'abierta',
      fechaCreacion: new Date()
    };
    this.rooms.push(room);
    return room;
  }

  public findRoomByCode(code: string): MultiplayerRoomEntity | undefined {
    return this.rooms.find(r => r.code === code);
  }

  public addPlayerToRoom(code: string, usuarioId: number, nombre: string): MultiplayerRoomEntity | null {
    const room = this.findRoomByCode(code);
    if (!room || room.estado !== 'abierta') return null;

    if (room.jugadores.some(p => p.usuarioId === usuarioId)) {
      return room;
    }

    room.jugadores.push({ usuarioId, nombre });
    room.estado = room.jugadores.length >= 2 ? 'completa' : 'abierta';
    return room;
  }
}

export const gamesRepository = new GamesRepository();
