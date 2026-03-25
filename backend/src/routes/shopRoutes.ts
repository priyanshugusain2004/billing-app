import { Router } from 'express';
import { authMiddleware, adminOnly, subscriptionActiveOnly } from '../middleware/auth.js';
import { usageTracker } from '../middleware/usageTracker.js';
import {
  getShop,
  updateShopSettings,
  getShopUsers,
  createShopUser,
} from '../controllers/shopController.js';

const router = Router();

// Protect all routes
router.use(authMiddleware, subscriptionActiveOnly);
router.use(usageTracker('shop-management'));

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
