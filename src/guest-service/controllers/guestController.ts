import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretajedrez';

let invitadoIdCounter = 1000;

export const createGuestSession = (req: Request, res: Response): void => {
  try {
    const { aliasTemporal } = req.body;

    const invitadoId = ++invitadoIdCounter;
    const alias = aliasTemporal || `Invitado_${invitadoId}`;

    const tokenInvitado = jwt.sign(
      { invitadoId, aliasTemporal: alias, esInvitado: true },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.status(201).json({
      invitadoId,
      tokenInvitado,
      aliasTemporal: alias,
      estadoSesion: 'activa'
    });

  } catch (error) {
    console.error('Error in createGuestSession:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
