import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  getShop,
  updateShopSettings,
  getShopUsers,
  createShopUser,
} from '../controllers/shopController.js';

const router = Router();

// Protect all routes
router.use(authMiddleware);

/**
 * @route GET /shop
 * @desc Get shop details and settings
 */
router.get('/', getShop);

/**
 * @route PUT /shop/settings
 * @desc Update shop settings (Admin only)
 */
router.put('/settings', adminOnly, updateShopSettings);

/**
 * @route GET /shop/users
 * @desc Get all users in the shop (Admin only)
 */
router.get('/users', adminOnly, getShopUsers);

/**
 * @route POST /shop/users
 * @desc Create a new user in the shop (Admin only)
 */
router.post('/users', adminOnly, createShopUser);

export default router;
