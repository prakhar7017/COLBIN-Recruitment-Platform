import express from 'express';
import { register, login, getMe } from '../controllers/auth';
import { registerValidator, loginValidator } from '../middleware/validators';
import { protect } from '../middleware/auth';

const router = express.Router();

// Register and login routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);

export default router;
