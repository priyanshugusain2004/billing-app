import { Router } from 'express';
import { getPlatformOverview } from '../controllers/analyticsController.js';
import { platformAdminOnly } from '../middleware/platformAdmin.js';

const router = Router();

router.use(platformAdminOnly);

/**
 * @route GET /analytics/overview
 * @desc Platform-level usage analytics for app owner
 */
router.get('/overview', getPlatformOverview);

export default router;
