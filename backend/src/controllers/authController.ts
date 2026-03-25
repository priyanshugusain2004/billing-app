import { Request, Response } from 'express';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { UsageEvent } from '../models/UsageEvent.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { ApiError } from '../utils/response.js';
import { config } from '../config/env.js';

/**
 * POST /auth/signup
 * Create a new shop and admin user
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      shopName,
      businessType,
      email,
      phone,
      username,
      password,
      address,
      paymentAmount,
      paymentReference,
    } = req.body;

    // Validation
    if (!shopName || !businessType || !email || !username || !password || !paymentReference) {
      throw new ApiError(400, 'Missing required fields including payment details');
    }

    if (Number(paymentAmount) !== config.subscription.onboardingFeeInr) {
      throw new ApiError(
        400,
        `Initial subscription payment must be INR ${config.subscription.onboardingFeeInr}`
      );
    }

    const subscriptionStart = new Date();
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + config.subscription.validityDays);

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
      subscription: {
        planName: 'starter-monthly',
        amountInr: Number(paymentAmount),
        startsAt: subscriptionStart,
        endsAt: subscriptionEnd,
        status: 'active',
        paymentReference,
        lastPaymentAt: subscriptionStart,
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

    UsageEvent.create({
      shopId: shop._id,
      userId: admin._id,
      actorEmail: admin.email,
      eventType: 'signup',
      feature: 'shop-onboarding',
      route: '/api/auth/signup',
      method: 'POST',
      statusCode: 201,
    }).catch(() => {
      // Analytics is non-blocking.
    });

    res.status(201).json({
      message: 'Shop created successfully',
      data: {
        shop: {
          id: shop._id,
          name: shop.name,
          businessType: shop.businessType,
          settings: shop.settings,
          subscription: shop.subscription,
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
    const { email, password, shopId } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email/username and password required');
    }

    const identifier = String(email).trim();
    const normalizedIdentifier = identifier.toLowerCase();

    // Find users by email (same person can own/use multiple shops)
    const users = await User.find({
      $or: [{ email: normalizedIdentifier }, { username: identifier }],
    })
      .select('+passwordHash')
      .populate('shopId');

    if (users.length === 0) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const usersWithValidPassword = [] as typeof users;
    for (const item of users) {
      const isValidPassword = await comparePassword(password, item.passwordHash);
      if (isValidPassword) {
        usersWithValidPassword.push(item);
      }
    }

    if (usersWithValidPassword.length === 0) {
      throw new ApiError(401, 'Invalid credentials');
    }

    let user = usersWithValidPassword[0];

    if (usersWithValidPassword.length > 1) {
      if (!shopId) {
        res.status(409).json({
          message: 'Multiple shops found for this account. Please select a shop.',
          code: 'MULTIPLE_SHOPS_FOUND',
          data: {
            shops: usersWithValidPassword.map((item) => {
              const shop = item.shopId as any;
              return {
                id: shop?._id?.toString(),
                name: shop?.name,
                businessType: shop?.businessType,
              };
            }),
          },
        });
        return;
      }

      const selectedUser = usersWithValidPassword.find(
        (item) => (item.shopId as any)?._id?.toString() === shopId
      );

      if (!selectedUser) {
        throw new ApiError(400, 'Invalid shop selection');
      }

      user = selectedUser;
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is inactive');
    }

    const shop = user.shopId as any;
    if (!shop) {
      throw new ApiError(404, 'Shop not found for user');
    }

    const isSubscriptionExpired = new Date(shop.subscription.endsAt).getTime() < Date.now();
    const isSubscriptionInactive = shop.subscription.status !== 'active';

    if (isSubscriptionExpired || isSubscriptionInactive) {
      if (isSubscriptionExpired && shop.subscription.status !== 'expired') {
        await Shop.findByIdAndUpdate(shop._id, {
          'subscription.status': 'expired',
        });
      }
      throw new ApiError(
        403,
        'Subscription is inactive or expired. Please renew your plan to continue.'
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      shopId: shop._id.toString(),
      role: user.role,
      email: user.email,
    });

    UsageEvent.create({
      shopId: shop._id,
      userId: user._id,
      actorEmail: user.email,
      eventType: 'login',
      feature: 'auth-login',
      route: '/api/auth/login',
      method: 'POST',
      statusCode: 200,
    }).catch(() => {
      // Analytics is non-blocking.
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
          id: shop._id,
          name: shop.name,
          settings: shop.settings,
          subscription: shop.subscription,
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
