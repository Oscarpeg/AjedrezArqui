import { Request, Response } from 'express';
import { gamesService } from '../services/games.service';
import { validateUserExists } from '../services/users.client';

export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioIdBlanco, usuarioIdNegro, modo } = req.body;

    if (!usuarioIdBlanco || !usuarioIdNegro) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const [blancoExiste, negroExiste] = await Promise.all([
      validateUserExists(Number(usuarioIdBlanco)),
      validateUserExists(Number(usuarioIdNegro))
    ]);

    if (!blancoExiste || !negroExiste) {
      res.status(404).json({ error: 'Uno o más usuarios no existen en users-service' });
      return;
    }

    const game = await gamesService.createGame(
      Number(usuarioIdBlanco),
      Number(usuarioIdNegro),
      modo || 'normal'
    );

    res.status(201).json({
      partidaId: game.partidaId,
      mensaje: `Partida creada - Modo ${game.modo}`,
      partida: {
        jugadores: game.jugadores,
        estado: game.estado,
        turno: game.turno
      }
    });

  } catch (error: any) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: error.message || 'Error del servidor' });
  }
};

export const getGameById = (req: Request, res: Response): void => {
  const { partidaId } = req.params;
  const game = gamesService.getGameById(Number(partidaId));
  
  if (!game) {
    res.status(404).json({ error: 'Partida no encontrada' });
    return;
  }

  const { intervaloSimulacion, ...gameData } = game as any;
  res.json(gameData);
};

export const getActiveGamesByUser = (req: Request, res: Response): void => {
  const { usuarioId } = req.params;
  const games = gamesService.getActiveGamesByUser(Number(usuarioId));
  
  const mappedGames = games.map(g => {
    const { intervaloSimulacion, ...data } = g as any;
    return data;
  });

  res.json(mappedGames);
};

export const stopSimulationHandler = (req: Request, res: Response): void => {
  const { partidaId } = req.params;
  const success = gamesService.stopGameSimulation(Number(partidaId));
  
  if (success) {
    res.json({ mensaje: 'Simulación detenida exitosamente' });
  } else {
    res.status(404).json({ error: 'Partida no encontrada o no estaba en simulación' });
  }
};
