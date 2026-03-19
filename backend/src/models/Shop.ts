import mongoose, { Schema, Document } from 'mongoose';

export interface IShopSettings {
  enableInventory: boolean;
  enableGST: boolean;
  enableQRPayment: boolean;
  enableDiscounts: boolean;
  language: 'en' | 'hi';
  gstNumber?: string;
  qrCodeUrl?: string;
}

export interface IShop extends Document {
  name: string;
  businessType: string; // 'fruit-shop', 'grocery', 'supermarket', etc.
  email: string;
  phone: string;
  address?: string;
  settings: IShopSettings;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    businessType: {
      type: String,
      required: true,
      enum: ['fruit-shop', 'grocery', 'supermarket', 'vegetable-shop', 'other'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    settings: {
      enableInventory: { type: Boolean, default: true },
      enableGST: { type: Boolean, default: false },
      enableQRPayment: { type: Boolean, default: false },
      enableDiscounts: { type: Boolean, default: true },
      language: { type: String, enum: ['en', 'hi'], default: 'en' },
      gstNumber: String,
      qrCodeUrl: String,
    },
  },
  { timestamps: true }
);

export const Shop = mongoose.model<IShop>('Shop', ShopSchema);
