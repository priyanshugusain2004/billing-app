import { Request, Response } from 'express';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken, TokenPayload } from '../utils/auth.js';
import { ApiError } from '../utils/response.js';

/**
 * POST /auth/signup
 * Create a new shop and admin user
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { shopName, businessType, email, phone, username, password, address } = req.body;

    // Validation
    if (!shopName || !businessType || !email || !username || !password) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if shop email already exists
    const existingShop = await Shop.findOne({ email: email.toLowerCase() });
    if (existingShop) {
      throw new ApiError(400, 'Shop with this email already exists');
    }

    // Create shop
    const shop = new Shop({
      name: shopName,
      businessType,
      email: email.toLowerCase(),
      phone,
      address,
      settings: {
        enableInventory: true,
        enableGST: false,
        enableQRPayment: false,
        enableDiscounts: true,
        language: 'en',
      },
    });

    await shop.save();

    // Hash password and create admin user
    const passwordHash = await hashPassword(password);
    const admin = new User({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Admin',
      shopId: shop._id,
    });

    await admin.save();

    // Generate token
    const token = generateToken({
      userId: admin._id.toString(),
      shopId: shop._id.toString(),
      role: admin.role,
      email: admin.email,
    });

    res.status(201).json({
      message: 'Shop created successfully',
      data: {
        shop: {
          id: shop._id,
          name: shop.name,
          businessType: shop.businessType,
          settings: shop.settings,
        },
        user: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || 'Signup failed' });
    }
  }
};

/**
 * POST /auth/login
 * Login user with email and password
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password required');
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash').populate('shopId');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is inactive');
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      shopId: user.shopId._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        shop: {
          id: user.shopId._id,
          name: user.shopId.name,
          settings: user.shopId.settings,
        },
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || 'Login failed' });
    }
  }
};
