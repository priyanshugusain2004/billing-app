import { Request, Response } from 'express';
import { Shop } from '../models/Shop.js';
import { UsageEvent } from '../models/UsageEvent.js';
import { User } from '../models/User.js';

export const getPlatformOverview = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalShops,
      activeSubscriptions,
      totalUsers,
      paidShops,
      revenueRows,
      featureUsageRows,
      activeShopRows,
      activeUserRows,
      recentEvents,
    ] = await Promise.all([
      Shop.countDocuments(),
      Shop.countDocuments({
        'subscription.status': 'active',
        'subscription.endsAt': { $gte: new Date() },
      }),
      User.countDocuments({ isActive: true }),
      Shop.countDocuments({ 'subscription.amountInr': { $gte: 500 } }),
      Shop.aggregate([{ $group: { _id: null, total: { $sum: '$subscription.amountInr' } } }]),
      UsageEvent.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: '$feature',
            count: { $sum: 1 },
            lastUsedAt: { $max: '$createdAt' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      UsageEvent.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, shopId: { $ne: null } } },
        { $group: { _id: '$shopId' } },
      ]),
      UsageEvent.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, userId: { $ne: null } } },
        { $group: { _id: '$userId' } },
      ]),
      UsageEvent.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .select('eventType feature method route statusCode createdAt actorEmail')
        .lean(),
    ]);

    res.json({
      message: 'Platform analytics fetched successfully',
      data: {
        summary: {
          totalShops,
          activeSubscriptions,
          totalUsers,
          paidShops,
          totalRevenueInr: revenueRows[0]?.total || 0,
          activeShopsLast30Days: activeShopRows.length,
          activeUsersLast30Days: activeUserRows.length,
        },
        featureUsageLast30Days: featureUsageRows.map((row) => ({
          feature: row._id,
          count: row.count,
          lastUsedAt: row.lastUsedAt,
        })),
        recentEvents,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch analytics' });
  }
};
