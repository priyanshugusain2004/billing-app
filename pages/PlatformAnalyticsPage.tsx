import React, { useMemo, useState } from 'react';
import { analyticsService } from '../src/services/api';

interface AnalyticsSummary {
  totalShops: number;
  activeSubscriptions: number;
  totalUsers: number;
  paidShops: number;
  totalRevenueInr: number;
  activeShopsLast30Days: number;
  activeUsersLast30Days: number;
}

interface FeatureUsage {
  feature: string;
  count: number;
  lastUsedAt: string;
}

interface EventItem {
  eventType: string;
  feature: string;
  method: string;
  route: string;
  statusCode: number;
  actorEmail?: string;
  createdAt: string;
}

interface AnalyticsOverview {
  summary: AnalyticsSummary;
  featureUsageLast30Days: FeatureUsage[];
  recentEvents: EventItem[];
}

const StatCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label,
  value,
  accent = 'text-sky-700',
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
  </div>
);

const PlatformAnalyticsPage: React.FC = () => {
  const [platformAdminKey, setPlatformAdminKey] = useState(
    () => localStorage.getItem('platformAdminKey') || ''
  );
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const revenuePerPaidShop = useMemo(() => {
    if (!data || data.summary.paidShops === 0) {
      return 0;
    }
    return Math.round(data.summary.totalRevenueInr / data.summary.paidShops);
  }, [data]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      localStorage.setItem('platformAdminKey', platformAdminKey);
      const overview = await analyticsService.getOverview(platformAdminKey);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 p-6 text-white">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="mt-1 text-sm text-slate-200">
          View app usage, paid shops, and feature activity without touching private shop business data.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={platformAdminKey}
            onChange={(e) => setPlatformAdminKey(e.target.value)}
            placeholder="Enter PLATFORM_ADMIN_KEY"
            className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading || !platformAdminKey}
            className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load Analytics'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </section>

      {data && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Shops" value={data.summary.totalShops} />
            <StatCard label="Paid Shops" value={data.summary.paidShops} accent="text-emerald-700" />
            <StatCard label="Active Subscriptions" value={data.summary.activeSubscriptions} accent="text-amber-700" />
            <StatCard label="Total Users" value={data.summary.totalUsers} />
            <StatCard label="Revenue (INR)" value={data.summary.totalRevenueInr} accent="text-indigo-700" />
            <StatCard label="Active Shops (30d)" value={data.summary.activeShopsLast30Days} />
            <StatCard label="Active Users (30d)" value={data.summary.activeUsersLast30Days} />
            <StatCard label="Avg Revenue/Paid Shop" value={revenuePerPaidShop} accent="text-fuchsia-700" />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Feature Usage (Last 30 Days)</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                      <th className="py-2 pr-3">Feature</th>
                      <th className="py-2 pr-3">Events</th>
                      <th className="py-2">Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.featureUsageLast30Days.map((item) => (
                      <tr key={item.feature} className="border-b border-slate-100">
                        <td className="py-2 pr-3 text-slate-800">{item.feature}</td>
                        <td className="py-2 pr-3 font-semibold text-slate-900">{item.count}</td>
                        <td className="py-2 text-slate-600">
                          {new Date(item.lastUsedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Recent Platform Events</h2>
              <div className="mt-3 max-h-[420px] overflow-auto text-sm">
                {data.recentEvents.map((event, idx) => (
                  <div key={`${event.createdAt}-${idx}`} className="mb-3 rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">
                      {event.eventType} - {event.feature}
                    </p>
                    <p className="text-slate-600">
                      {event.method} {event.route} - {event.statusCode}
                    </p>
                    <p className="text-xs text-slate-500">{event.actorEmail || 'unknown user'}</p>
                    <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PlatformAnalyticsPage;
