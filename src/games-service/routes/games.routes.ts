import { Router } from 'express';
import { createGame, getGameById, getActiveGamesByUser, stopSimulationHandler } from '../controllers/games.controller';

const router = Router();

router.post('/', createGame);
router.get('/:partidaId', getGameById);
router.get('/usuario/:usuarioId/activas', getActiveGamesByUser);
router.post('/:partidaId/detener-simulacion', stopSimulationHandler);

export default router;
