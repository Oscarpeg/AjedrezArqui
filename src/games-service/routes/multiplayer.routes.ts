import { Router } from 'express';
import { createMultiplayerRoom, joinMultiplayerRoom } from '../controllers/multiplayer.controller';

const router = Router();

router.post('/create', createMultiplayerRoom);
router.post('/join', joinMultiplayerRoom);

export default router;
