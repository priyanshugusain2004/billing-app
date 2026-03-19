import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

// Protect all routes
router.use(authMiddleware);

/**
 * @route GET /products
 * @desc Get all products for the shop
 */
router.get('/', getProducts);

/**
 * @route POST /products
 * @desc Create a new product (Admin only)
 */
router.post('/', adminOnly, createProduct);

/**
 * @route PUT /products/:id
 * @desc Update a product (Admin only)
 */
router.put('/:id', adminOnly, updateProduct);

/**
 * @route DELETE /products/:id
 * @desc Delete a product (Admin only)
 */
router.delete('/:id', adminOnly, deleteProduct);

export default router;
