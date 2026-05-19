import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export { User };

export const findUserByEmail = async (correoElectronico: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { correoElectronico }
  });
};

export const findUserByUsername = async (nombreUsuario: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { nombreUsuario }
  });
};

export const findUserById = async (usuarioId: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { usuarioId }
  });
};

export const createUser = async (userData: { correoElectronico: string; contrasena: string; nombreUsuario: string }): Promise<User> => {
  return prisma.user.create({
    data: {
      ...userData,
      elo: 1200,
      victorias: 0,
      derrotas: 0,
      empates: 0
    }
  });
};

export const getRanking = async (): Promise<User[]> => {
  return prisma.user.findMany({
    orderBy: { elo: 'desc' },
    take: 10
  });
};

export const updateElo = async (usuarioId: number, newElo: number, win?: boolean, draw?: boolean): Promise<User> => {
  return prisma.user.update({
    where: { usuarioId },
    data: {
      elo: newElo,
      victorias: win === true ? { increment: 1 } : undefined,
      derrotas: win === false ? { increment: 1 } : undefined,
      empates: draw === true ? { increment: 1 } : undefined
    }
  });
};

export const upsertUserByEmail = async (data: { correoElectronico: string; nombreUsuario: string }): Promise<User> => {
  // If user exists, we just return it (or update last login if we had that field)
  // If not, we create it with a dummy password since they use Google
  const existing = await prisma.user.findUnique({ where: { correoElectronico: data.correoElectronico } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      correoElectronico: data.correoElectronico,
      nombreUsuario: data.nombreUsuario,
      contrasena: 'OAUTH_USER_' + Math.random().toString(36).substring(7), // Dummy password
      elo: 1200,
      victorias: 0,
      derrotas: 0,
      empates: 0
    }
  });
};
