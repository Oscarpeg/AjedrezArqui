import { Router } from 'express';
import { registerUser, getUserByEmail, getUserById, getRankingHandler, getUserStats, upsertUser } from '../controllers/userController';

const router = Router();

// Public route
router.post('/register', registerUser);

// Internal routes (in a real app, these should be protected from public access)
router.get('/internal/users/email/:email', getUserByEmail);
router.post('/internal/users/upsert', upsertUser);
router.get('/internal/users/:id', getUserById);

// Ranking and Stats routes
router.get('/ranking', getRankingHandler);
router.get('/players/:id/stats', getUserStats);

export default router;
