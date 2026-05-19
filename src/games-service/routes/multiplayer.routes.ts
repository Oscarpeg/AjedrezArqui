import { Router } from 'express';
import { createMultiplayerRoom, joinMultiplayerRoom } from '../controllers/multiplayer.controller';

const router = Router();

router.post('/', createMultiplayerRoom);
router.post('/:code/players', joinMultiplayerRoom);

export default router;
