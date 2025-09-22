import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/users';
import { profileUpdateValidator } from '../middleware/validators';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', profileUpdateValidator, updateUserProfile);

export default router;
