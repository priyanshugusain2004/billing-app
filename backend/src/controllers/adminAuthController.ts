import { Request, Response } from 'express';
import { config } from '../config/env.js';
import jwt from 'jsonwebtoken';

/**
 * Admin Token Payload
 */
export interface AdminTokenPayload {
  type: 'admin';
  issuedAt: number;
}

/**
 * POST /api/admin/login
 * Login with admin password stored in environment variable
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    // Check against env variable
    const adminPassword = process.env.ADMIN_PASSWORD || config.admin?.password;

    if (!adminPassword) {
      res.status(500).json({ message: 'Admin not configured' });
      return;
    }

    if (password !== adminPassword) {
      res.status(401).json({ message: 'Invalid admin password' });
      return;
    }

    // Generate admin token (different from user tokens)
    const adminToken = jwt.sign(
      { type: 'admin', issuedAt: Date.now() } as AdminTokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiry as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      message: 'Admin login successful',
      token: adminToken,
      type: 'admin',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * POST /api/admin/logout
 * Logout admin (token invalidation on frontend)
 */
export const adminLogout = (req: Request, res: Response): void => {
  res.json({ message: 'Admin logged out successfully' });
};
