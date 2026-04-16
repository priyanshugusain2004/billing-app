import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';

/**
 * Extend Express Request to include admin data
 */
declare global {
  namespace Express {
    interface Request {
      adminToken?: {
        type: 'admin';
        issuedAt: number;
      };
    }
  }
}

/**
 * Admin authentication middleware
 * Verifies admin token (separate from shop user tokens)
 */
export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ message: 'No admin token provided' });
      return;
    }

    const payload = verifyToken(token);

    // Check if this is an admin token
    if (payload.type !== 'admin') {
      res.status(403).json({ message: 'Not an admin token' });
      return;
    }

    req.adminToken = payload as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};
