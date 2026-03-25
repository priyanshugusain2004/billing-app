import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { UsageEvent } from '../models/UsageEvent.js';

export const usageTracker = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (!req.shopId || !req.user) {
        return;
      }

      const userId = mongoose.Types.ObjectId.isValid(req.user.userId)
        ? new mongoose.Types.ObjectId(req.user.userId)
        : undefined;

      UsageEvent.create({
        shopId: new mongoose.Types.ObjectId(req.shopId),
        userId,
        actorEmail: req.user.email,
        eventType: 'feature',
        feature,
        route: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
      }).catch(() => {
        // Analytics should not block business operations.
      });
    });

    next();
  };
};
