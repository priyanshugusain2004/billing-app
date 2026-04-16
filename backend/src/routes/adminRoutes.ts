import { Router } from 'express';
import { adminLogin, adminLogout } from '../controllers/adminAuthController.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';
import { getPlatformOverview } from '../controllers/analyticsController.js';

const router = Router();

/**
 * @route POST /api/admin/login
 * @desc Authenticate as admin with password
 * @body { password: string }
 * @returns { token: string, type: 'admin' }
 */
router.post('/login', adminLogin);

/**
 * @route POST /api/admin/logout
 * @desc Logout admin
 */
router.post('/logout', adminAuthMiddleware, adminLogout);

/**
 * @route GET /api/admin/analytics
 * @desc Get platform-wide analytics (admin only)
 * @headers Authorization: Bearer <admin_token>
 */
router.get('/analytics', adminAuthMiddleware, getPlatformOverview);

export default router;
