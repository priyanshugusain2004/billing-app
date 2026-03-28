import mongoose, { Schema, Document } from 'mongoose';

export interface IUsageLog extends Document {
  shopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  feature: string; // 'products', 'orders', 'billing', 'inventory', etc.
  action: string; // 'view', 'create', 'update', 'delete'
  endpoint: string;
  method: string; // GET, POST, PUT, DELETE
  statusCode: number;
  responseTime: number; // milliseconds
  createdAt: Date;
}

const UsageLogSchema = new Schema<IUsageLog>(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feature: {
      type: String,
      enum: ['products', 'orders', 'shop', 'users', 'auth', 'billing'],
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['view', 'create', 'update', 'delete', 'login'],
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for querying usage over time
UsageLogSchema.index({ createdAt: -1 });
UsageLogSchema.index({ shopId: 1, createdAt: -1 });

export const UsageLog = mongoose.model<IUsageLog>('UsageLog', UsageLogSchema);

/**
 * Admin analytics - aggregated data
 */
export interface IAdminAnalytics extends Document {
  totalShops: number;
  totalUsers: number;
  totalRevenue: number; // in INR
  activeSubscriptions: number;
  expiredSubscriptions: number;
  monthlyActiveUsers: number;
  topFeatures: Array<{
    name: string;
    usage: number;
  }>;
  lastUpdated: Date;
}

const AdminAnalyticsSchema = new Schema<IAdminAnalytics>(
  {
    totalShops: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    expiredSubscriptions: { type: Number, default: 0 },
    monthlyActiveUsers: { type: Number, default: 0 },
    topFeatures: [
      {
        name: String,
        usage: Number,
      },
    ],
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const AdminAnalytics = mongoose.model<IAdminAnalytics>(
  'AdminAnalytics',
  AdminAnalyticsSchema
);
