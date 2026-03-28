import { Request, Response } from 'express';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/response.js';
import { hashPassword } from '../utils/auth.js';

/**
 * GET /shop
 * Get shop details and settings
 */
export const getShop = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const shop = await Shop.findById(req.shopId);

    if (!shop) {
      throw new ApiError(404, 'Shop not found');
    }

    res.json({
      message: 'Shop details fetched',
      data: shop,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * PUT /shop/settings
 * Update shop settings (Admin only)
 */
export const updateShopSettings = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const { name, businessType, phone, address, settings } = req.body;

    const shop = await Shop.findById(req.shopId);

    if (!shop) {
      throw new ApiError(404, 'Shop not found');
    }

    // Update basic info
    if (name) shop.name = name;
    if (businessType) shop.businessType = businessType;
    if (phone) shop.phone = phone;
    if (address) shop.address = address;

    // Update settings
    if (settings) {
      shop.settings = {
        ...shop.settings,
        ...settings,
      };
    }

    await shop.save();

    res.json({
      message: 'Shop settings updated',
      data: shop,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * GET /shop/users
 * Get all users in the shop (Admin only)
 */
export const getShopUsers = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const users = await User.find({ shopId: req.shopId }).select('-passwordHash');

    res.json({
      message: 'Users fetched',
      data: users,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * POST /shop/users
 * Create a new user in the shop (Admin only)
 */
export const createShopUser = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if user already exists in this shop
    const existingUser = await User.findOne({ username, shopId: req.shopId });
    if (existingUser) {
      throw new ApiError(400, 'Username already exists in this shop');
    }

    const passwordHash = await hashPassword(password);

    const user = new User({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role,
      shopId: req.shopId,
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
