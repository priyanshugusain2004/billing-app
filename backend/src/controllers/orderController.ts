import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/response.js';

/**
 * POST /orders
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.shopId || !req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const { items, paymentMethod, discount = 0, gst = 0, notes } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must have at least one item');
    }

    if (!paymentMethod) {
      throw new ApiError(400, 'Payment method required');
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        shopId: req.shopId,
      });

      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Reduce stock
      product.stock -= item.quantity;
      if (product.stock < 0) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
      await product.save();

      processedItems.push({
        productId: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        weightInGrams: item.weightInGrams,
      });
    }

    const finalTotal = subtotal - discount + (gst || 0);

    const order = new Order({
      items: processedItems,
      subtotal,
      discount,
      gst: gst || 0,
      finalTotal,
      paymentMethod,
      shopId: req.shopId,
      createdBy: req.user.userId,
      notes,
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * GET /orders
 * Get all orders for the shop (with pagination)
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ shopId: req.shopId })
        .populate('createdBy', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ shopId: req.shopId }),
    ]);

    res.json({
      message: 'Orders fetched successfully',
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * GET /orders/stats
 * Get sales statistics for the shop
 */
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const stats = await Order.aggregate([
      { $match: { shopId: require('mongoose').Types.ObjectId(req.shopId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalTotal' },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: '$discount' },
          avgOrderValue: { $avg: '$finalTotal' },
        },
      },
    ]);

    const revenueByPayment = await Order.aggregate([
      { $match: { shopId: require('mongoose').Types.ObjectId(req.shopId) } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$finalTotal' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      message: 'Stats fetched successfully',
      data: {
        summary: stats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          totalDiscount: 0,
          avgOrderValue: 0,
        },
        byPaymentMethod: revenueByPayment,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
