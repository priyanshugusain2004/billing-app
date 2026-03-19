import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/response.js';

/**
 * GET /products
 * Get all products for the shop
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found in token');
    }

    const products = await Product.find({ shopId: req.shopId }).sort({ createdAt: -1 });

    res.json({
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * POST /products
 * Create a new product (Admin only)
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const { name, price, stock, category, image, description, sku } = req.body;

    if (!name || price === undefined || !category || !image) {
      throw new ApiError(400, 'Missing required fields: name, price, category, image');
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      image,
      description,
      sku,
      shopId: req.shopId,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * PUT /products/:id
 * Update a product (Admin only)
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const { id } = req.params;
    const { name, price, stock, category, image, description, sku } = req.body;

    const product = await Product.findOne({ _id: id, shopId: req.shopId });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Update fields
    if (name) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;
    if (image) product.image = image;
    if (description) product.description = description;
    if (sku) product.sku = sku;

    await product.save();

    res.json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * DELETE /products/:id
 * Delete a product (Admin only)
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.shopId) {
      throw new ApiError(401, 'Shop ID not found');
    }

    const { id } = req.params;

    const result = await Product.deleteOne({ _id: id, shopId: req.shopId });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      message: 'Product deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
