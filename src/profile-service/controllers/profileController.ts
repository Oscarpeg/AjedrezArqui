import { Request, Response } from 'express';
import axios from 'axios';

const USERS_SERVICE_URL = 'http://localhost:3001';

// Almacenamiento en memoria para datos de perfil extendidos
const perfilesExtendidos: Map<string, {
  aliasUsuario?: string;
  avatarUrl?: string;
  descripcion?: string;
  puntuacionElo?: number;
}> = new Map();

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    let user;
    try {
      const response = await axios.get(`${USERS_SERVICE_URL}/internal/users/${userId}`);
      user = response.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      throw err;
    }

    const datosExtendidos = perfilesExtendidos.get(userId as string) || {};

    res.json({
      aliasUsuario: datosExtendidos.aliasUsuario || user.nombreUsuario,
      avatarUrl: datosExtendidos.avatarUrl || null,
      descripcion: datosExtendidos.descripcion || '',
      puntuacionElo: datosExtendidos.puntuacionElo ?? 1200,
      partidasJugadas: 0,
      porcentajeVictorias: 0
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { aliasUsuario, avatarUrl, descripcion, puntuacionElo } = req.body;

    // Verificar que el usuario existe en users-service
    try {
      await axios.get(`${USERS_SERVICE_URL}/internal/users/${userId}`);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      throw err;
    }

    // Obtener datos actuales o crear nuevos
    const datosActuales = perfilesExtendidos.get(userId as string) || {};

    // Actualizar solo los campos enviados
    const datosActualizados = {
      ...datosActuales,
      ...(aliasUsuario !== undefined && { aliasUsuario }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(descripcion !== undefined && { descripcion }),
      ...(puntuacionElo !== undefined && { puntuacionElo })
    };

    perfilesExtendidos.set(userId as string, datosActualizados);

    res.json({
      mensaje: 'Perfil actualizado exitosamente',
      perfil: {
        aliasUsuario: datosActualizados.aliasUsuario,
        avatarUrl: datosActualizados.avatarUrl || null,
        descripcion: datosActualizados.descripcion || '',
        puntuacionElo: datosActualizados.puntuacionElo ?? 1200
      }
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
