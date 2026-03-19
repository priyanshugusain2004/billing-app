import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  Admin = 'Admin',
  Cashier = 'Cashier',
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  shopId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't include by default in queries
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Cashier,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true, // For faster queries by shop
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique constraint: username + shopId (allow same username in different shops)
UserSchema.index({ username: 1, shopId: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
