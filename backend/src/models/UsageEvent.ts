import mongoose, { Document, Schema } from 'mongoose';

export type UsageEventType = 'signup' | 'login' | 'feature';

export interface IUsageEvent extends Document {
  shopId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  eventType: UsageEventType;
  feature: string;
  route: string;
  method: string;
  statusCode: number;
  createdAt: Date;
  updatedAt: Date;
}

const UsageEventSchema = new Schema<IUsageEvent>(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['signup', 'login', 'feature'],
      required: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

UsageEventSchema.index({ createdAt: -1 });

export const UsageEvent = mongoose.model<IUsageEvent>('UsageEvent', UsageEventSchema);
