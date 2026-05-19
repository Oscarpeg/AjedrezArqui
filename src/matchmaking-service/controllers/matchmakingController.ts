import { Request, Response } from 'express';
import { matchmakingService } from '../services/matchmaking.service';

export const findMatch = (req: Request, res: Response): void => {
  try {
    const { usuarioId, puntuacionElo } = req.body;

    if (!usuarioId || puntuacionElo === undefined) {
      res.status(400).json({ error: 'Faltan campos obligatorios (usuarioId, puntuacionElo)' });
      return;
    }

    const result = matchmakingService.findMatch({
      usuarioId: Number(usuarioId),
      puntuacionElo: Number(puntuacionElo),
      timestamp: new Date()
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in findMatch:', error);
    res.status(500).json({ error: error.message || 'Error del servidor' });
  }
};

export const getQueue = (_req: Request, res: Response): void => {
  const queue = matchmakingService.getQueue();
  res.json({ colaEspera: queue });
};
