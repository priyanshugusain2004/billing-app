import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { Shop } from '../models/Shop.js';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      shopId?: string;
    }
  }
}

/**
 * Authentication middleware - Verify JWT token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    req.shopId = payload.shopId;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Admin-only middleware
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'Admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};

/**
 * Subscription middleware - Ensure shop subscription is active
 */
export const subscriptionActiveOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.shopId) {
      res.status(401).json({ message: 'Shop ID not found' });
      return;
    }

    const shop = await Shop.findById(req.shopId).select('subscription');
    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    const subscriptionEndsAt = new Date(shop.subscription.endsAt).getTime();
    const isExpired = subscriptionEndsAt < Date.now();
    const isInactive = shop.subscription.status !== 'active';

    if (isExpired || isInactive) {
      if (isExpired && shop.subscription.status !== 'expired') {
        await Shop.findByIdAndUpdate(req.shopId, { 'subscription.status': 'expired' });
      }

      res.status(403).json({
        message: 'Subscription is inactive or expired. Please renew your plan to continue.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Subscription validation failed' });
  }
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
