import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserByUsername, createUser, findUserById, getRanking, upsertUserByEmail } from '../models/userModel';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correoElectronico, contrasena, nombreUsuario } = req.body;

    if (!correoElectronico || !contrasena || !nombreUsuario) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const existingEmail = await findUserByEmail(correoElectronico);
    if (existingEmail) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      return;
    }

    const existingUsername = await findUserByUsername(nombreUsuario);
    if (existingUsername) {
      res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const newUser = await createUser({
      correoElectronico,
      contrasena: hashedPassword,
      nombreUsuario
    });

    res.status(201).json({
      usuarioId: newUser.usuarioId,
      mensaje: 'Usuario creado'
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email as string;
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await findUserById(Number(id));
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const getRankingHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (error) {
    console.error('Error in getRanking:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await findUserById(Number(id));
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const { contrasena, ...stats } = user as any;
    res.json(stats);
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
export const upsertUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correoElectronico, nombreUsuario } = req.body;
    if (!correoElectronico || !nombreUsuario) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const user = await upsertUserByEmail({ correoElectronico, nombreUsuario });
    res.json(user);
  } catch (error) {
    console.error('Error in upsertUser:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
