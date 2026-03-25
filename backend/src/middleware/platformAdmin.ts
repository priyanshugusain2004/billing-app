import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env.js';

export const platformAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const platformAdminKey = req.headers['x-platform-admin-key'];

  if (!config.analytics.adminKey) {
    res.status(503).json({
      message: 'Platform analytics is not configured. Set PLATFORM_ADMIN_KEY in backend env.',
    });
    return;
  }

  if (!platformAdminKey || platformAdminKey !== config.analytics.adminKey) {
    res.status(401).json({ message: 'Unauthorized platform analytics access' });
    return;
  }

  next();
};
