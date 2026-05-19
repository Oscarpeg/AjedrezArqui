import { Router } from 'express';
import { loginUser, generateQr, confirmQr, mobileLoginPage, mobileLoginSubmit } from '../controllers/authController';

const router = Router();

router.post('/login', loginUser);
router.get('/auth/qr/generate', generateQr);
router.post('/auth/qr/confirm', confirmQr);
router.get('/mobile/login', mobileLoginPage);
router.post('/mobile/login', mobileLoginSubmit);

export default router;
