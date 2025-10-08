import express from 'express';
import { 
  register, 
  login, 
  getUsers, 
  verifyEmail, 
  bulkAction 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);

// Protected routes
router.get('/users', verifyToken, getUsers);
router.post('/bulk-action', verifyToken, bulkAction);

export default router;