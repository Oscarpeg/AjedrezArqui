import { gamesModel, Game } from '../models/games.model';
import { GameManagerService } from './gameManager.service';

const getRandomWinner = (jugadores: Game['jugadores']): { ganadorId: number | null; razon: string } => {
  const rand = Math.random();
  if (rand < 0.33) return { ganadorId: null, razon: 'tablas' };
  if (rand < 0.66) return { ganadorId: jugadores[0].usuarioId, razon: 'simulacion' };
  return { ganadorId: jugadores[1].usuarioId, razon: 'simulacion' };
};

export const startSimulation = (gameId: number): void => {
  const game = gamesModel.findById(gameId);
  if (!game || !game.modoSimulacion) return;

  // Asegurarse de que el GameManagerService tenga la partida sincronizada
  const gameInstance = GameManagerService.getGame(String(gameId));

  if (game.intervaloSimulacion) {
    clearInterval(game.intervaloSimulacion);
  }

  console.log(`[Simulación] Iniciando IA para partida ${gameId}`);

  const interval = setInterval(() => {
    const currentGame = gamesModel.findById(gameId);
    if (!currentGame || currentGame.estado !== 'activa') {
      clearInterval(interval);
      return;
    }

    const colorMoving = currentGame.turno;
    const playerMoving = currentGame.jugadores.find(p => p.color === colorMoving);
    
    if (playerMoving) {
      const legalMoves = gameInstance.moves({ verbose: true });
      
      if (legalMoves.length > 0) {
        // IA Básica: Priorizar capturas, si no, movimiento aleatorio legal
        const captures = legalMoves.filter(m => m.captured);
        const move = captures.length > 0 
          ? captures[Math.floor(Math.random() * captures.length)]
          : legalMoves[Math.floor(Math.random() * legalMoves.length)];

        console.log(`[Simulación] IA (${colorMoving}) mueve de ${move.from} a ${move.to}`);
        
        gamesModel.addMoveToGame(gameId, {
          jugadorId: playerMoving.usuarioId,
          color: colorMoving,
          origen: move.from,
          destino: move.to,
          timestamp: new Date()
        });

        // Actualizar el estado interno de chess.js
        gameInstance.move(move);
      }
    }

    // Verificar si la partida terminó según las reglas de ajedrez
    if (gameInstance.isGameOver()) {
      let winner = null;
      let razon = 'tablas';
      
      if (gameInstance.isCheckmate()) {
        const winnerColor = gameInstance.turn() === 'w' ? 'negro' : 'blanco';
        const winnerPlayer = currentGame.jugadores.find(p => p.color === winnerColor);
        winner = winnerPlayer ? winnerPlayer.usuarioId : null;
        razon = 'jaque mate';
      }

      console.log(`[Simulación] Partida ${gameId} FINALIZADA: ${razon}`);
      gamesModel.finishGame(gameId, { ganadorId: winner, razon });
      clearInterval(interval);
      GameManagerService.removeGame(String(gameId));
    }

  }, 3000); // Movimiento cada 3 segundos

  gamesModel.update(gameId, { intervaloSimulacion: interval });
};

export const stopSimulation = (gameId: number): boolean => {
  const game = gamesModel.findById(gameId);
  if (game && game.intervaloSimulacion) {
    clearInterval(game.intervaloSimulacion);
    gamesModel.update(gameId, { intervaloSimulacion: null, modoSimulacion: false });
    console.log(`[Simulación] Partida ${gameId} detenida manualmente.`);
    return true;
  }
  return false;
};
