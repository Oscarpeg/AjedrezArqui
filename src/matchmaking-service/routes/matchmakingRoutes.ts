import { Router } from 'express';
import { findMatch, getQueue } from '../controllers/matchmakingController';

const router = Router();

router.post('/find', findMatch);
router.get('/queue', getQueue);

export default router;
