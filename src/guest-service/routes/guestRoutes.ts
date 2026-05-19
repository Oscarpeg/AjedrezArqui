import { Router } from 'express';
import { createGuestSession } from '../controllers/guestController';

const router = Router();

router.post('/', createGuestSession);

export default router;
