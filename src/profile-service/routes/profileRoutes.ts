import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = Router();

router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);

export default router;
