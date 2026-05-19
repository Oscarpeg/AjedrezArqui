import { Router } from 'express';
import { loginUser, generateQr, confirmQr, mobileLoginPage, mobileLoginSubmit } from '../controllers/authController';

const router = Router();

router.post('/auth/login', loginUser);
router.post('/auth/qr', generateQr);
router.patch('/auth/qr/:sessionId', confirmQr);
router.get('/auth/mobile', mobileLoginPage);
router.post('/auth/mobile', mobileLoginSubmit);

export default router;
