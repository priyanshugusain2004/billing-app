import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentMethod {
  Cash = 'Cash',
  Online = 'Online',
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  weightInGrams: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  gst?: number; // If enabled
  finalTotal: number;
  paymentMethod: PaymentMethod;
  shopId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // User/Cashier ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
    },
    weightInGrams: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: String,
  },
  { timestamps: true }
);

// Index for sales reports
OrderSchema.index({ shopId: 1, createdAt: -1 });
OrderSchema.index({ shopId: 1, paymentMethod: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
