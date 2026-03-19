import mongoose, { Schema, Document } from 'mongoose';

export enum ProductCategory {
  Fruit = 'Fruit',
  Vegetable = 'Vegetable',
  Other = 'Other',
}

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: number;
  category: ProductCategory;
  image: string; // Base64 or URL
  shopId: mongoose.Types.ObjectId;
  description?: string;
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      default: ProductCategory.Other,
    },
    image: {
      type: String,
      required: true,
    },
    description: String,
    sku: {
      type: String,
      sparse: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for shop queries
ProductSchema.index({ shopId: 1, name: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
