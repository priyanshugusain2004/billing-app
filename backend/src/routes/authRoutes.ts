import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';

const router = Router();

/**
 * @route POST /auth/signup
 * @desc Create a new shop and admin user
 */
router.post('/signup', signup);

/**
 * @route POST /auth/login
 * @desc Login with email and password
 */
router.post('/login', login);

export default router;
