import React, { useState, useEffect } from 'react';
import { adminService } from '../src/services/adminApi';

interface AnalyticsData {
  totalShops?: number;
  paidShops?: number;
  activeSubscriptions?: number;
  totalUsers?: number;
  totalRevenue?: number;
  activeShopsLast30Days?: number;
  activeUsersLast30Days?: number;
  avgRevenuePerPaidShop?: number;
  featureUsage?: Array<{
    feature: string;
    eventCount: number;
    lastUsed: string;
  }>;
  recentEvents?: Array<{
    id: string;
    eventType: string;
    feature: string;
    httpMethod: string;
    route: string;
    statusCode: number;
    actorEmail: string;
    timestamp: string;
  }>;
}

const OwnerAdminPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalytics(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Shops</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalShops || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Paid Shops</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{analytics?.paidShops || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{analytics?.activeSubscriptions || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalUsers || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Revenue (INR)</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">₹{(analytics?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Active Shops (30d)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.activeShopsLast30Days || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Active Users (30d)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.activeUsersLast30Days || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Avg Revenue/Shop</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">₹{(analytics?.avgRevenuePerPaidShop || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Feature Usage Table */}
      {analytics?.featureUsage && analytics.featureUsage.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Feature Usage (Last 30 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Feature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Last Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.featureUsage.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.eventCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.lastUsed).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Events Table */}
      {analytics?.recentEvents && analytics.recentEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Platform Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Event Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Feature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{event.eventType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.feature}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.route}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        event.statusCode >= 200 && event.statusCode < 300
                          ? 'bg-green-100 text-green-800'
                          : event.statusCode >= 400
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.actorEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAdminPage;
