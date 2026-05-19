import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const players = [
    { nombreUsuario: 'MagnusCarlsen', correoElectronico: 'magnus@chess.com', elo: 2850 },
    { nombreUsuario: 'HikaruNakamura', correoElectronico: 'hikaru@chess.com', elo: 2750 },
    { nombreUsuario: 'GothamChess', correoElectronico: 'levy@chess.com', elo: 2350 },
    { nombreUsuario: 'Principiante', correoElectronico: 'nuevo@chess.com', elo: 800 },
    { nombreUsuario: 'Aficionado', correoElectronico: 'aficionado@chess.com', elo: 1200 },
    { nombreUsuario: 'Experto', correoElectronico: 'experto@chess.com', elo: 1600 },
    { nombreUsuario: 'Avanzado', correoElectronico: 'avanzado@chess.com', elo: 2000 },
  ];

  console.log('Seeding players...');

  for (const player of players) {
    await prisma.user.upsert({
      where: { correoElectronico: player.correoElectronico },
      update: {},
      create: {
        nombreUsuario: player.nombreUsuario,
        correoElectronico: player.correoElectronico,
        contrasena: passwordHash,
        elo: player.elo,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
