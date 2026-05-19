import { Request, Response } from 'express';
import { createRoom, joinRoom } from '../services/multiplayer.service';

export const createMultiplayerRoom = (req: Request, res: Response): void => {
  try {
    const { usuarioId, nombre } = req.body;
    if (!usuarioId || !nombre) {
      res.status(400).json({ error: 'Faltan campos obligatorios (usuarioId, nombre)' });
      return;
    }

    const room = createRoom(Number(usuarioId), nombre);
    res.status(201).json({ code: room.code, roomId: room.roomId });
  } catch (error: any) {
    console.error('Error creating multiplayer room:', error);
    res.status(500).json({ error: error.message || 'Error del servidor' });
  }
};

export const joinMultiplayerRoom = (req: Request, res: Response): void => {
  try {
    const { code, usuarioId, nombre } = req.body;
    if (!code || !usuarioId || !nombre) {
      res.status(400).json({ error: 'Faltan campos obligatorios (code, usuarioId, nombre)' });
      return;
    }

    const room = joinRoom(code, Number(usuarioId), nombre);
    if (!room) {
      res.status(404).json({ error: 'Sala no encontrada o ya completa' });
      return;
    }

    res.json({ code: room.code, roomId: room.roomId, jugador: { usuarioId: Number(usuarioId), nombre } });
  } catch (error: any) {
    console.error('Error joining multiplayer room:', error);
    res.status(500).json({ error: error.message || 'Error del servidor' });
  }
};
