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

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface IShopSubscription {
  planName: string;
  amountInr: number;
  startsAt: Date;
  endsAt: Date;
  status: SubscriptionStatus;
  paymentReference: string;
  lastPaymentAt: Date;
}

export interface IShop extends Document {
  name: string;
  businessType: string; // 'fruit-shop', 'grocery', 'supermarket', etc.
  email: string;
  phone: string;
  address?: string;
  settings: IShopSettings;
  subscription: IShopSubscription;
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
    subscription: {
      planName: { type: String, default: 'starter-monthly' },
      amountInr: { type: Number, required: true, min: 0, default: 500 },
      startsAt: { type: Date, required: true, default: Date.now },
      endsAt: {
        type: Date,
        required: true,
        default: () => {
          const now = new Date();
          now.setDate(now.getDate() + 30);
          return now;
        },
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
      },
      paymentReference: { type: String, required: true },
      lastPaymentAt: { type: Date, required: true, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Shop = mongoose.model<IShop>('Shop', ShopSchema);
