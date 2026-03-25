import { Router } from 'express';
import { authMiddleware, adminOnly, subscriptionActiveOnly } from '../middleware/auth.js';
import { usageTracker } from '../middleware/usageTracker.js';
import {
  createOrder,
  getOrders,
  getOrderStats,
} from '../controllers/orderController.js';

const router = Router();

// Protect all routes
router.use(authMiddleware, subscriptionActiveOnly);
router.use(usageTracker('orders'));

/**
 * @route POST /orders
 * @desc Create a new order
 */
router.post('/', createOrder);

/**
 * @route GET /orders
 * @desc Get all orders for the shop (with pagination)
 */
router.get('/', getOrders);

/**
 * @route GET /orders/stats
 * @desc Get sales statistics (Admin only)
 */
router.get('/stats', adminOnly, getOrderStats);

export default router;
