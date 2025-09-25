
import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import SalesChart from '../components/reports/SalesChart';
import { format } from 'date-fns';
import { useTranslation } from '../hooks/useTranslation';

const ReportsPage: React.FC = () => {
    const { sales } = useStore();
    const { t } = useTranslation();
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const totalSales = useMemo(() => sales.reduce((acc, sale) => acc + sale.finalTotal, 0), [sales]);
    const totalWeightSoldInKg = useMemo(() => sales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.weightInGrams, 0), 0) / 1000, [sales]);
    const averageSaleValue = useMemo(() => sales.length > 0 ? totalSales / sales.length : 0, [totalSales, sales.length]);

    const timeframeButtons = [
        { key: 'daily', label: t('reportsPage.daily') },
        { key: 'weekly', label: t('reportsPage.weekly') },
        { key: 'monthly', label: t('reportsPage.monthly') }
    ] as const;

    return (
        <div className="container mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{t('reportsPage.title')}</h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">{t('reportsPage.totalRevenue')}</h3>
                    <p className="text-3xl font-bold text-primary-dark mt-2">₹{totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">{t('reportsPage.totalWeightSold')}</h3>
                    <p className="text-3xl font-bold text-primary-dark mt-2">{totalWeightSoldInKg.toFixed(2)} kg</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">{t('reportsPage.avgSaleValue')}</h3>
                    <p className="text-3xl font-bold text-primary-dark mt-2">₹{averageSaleValue.toFixed(2)}</p>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-700">{t('reportsPage.salesOverTime')}</h2>
                     <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                        {timeframeButtons.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTimeframe(key)}
                                className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
                                    timeframe === key
                                        ? 'bg-primary text-white shadow'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                     </div>
                 </div>
                <SalesChart sales={sales} timeframe={timeframe} />
            </div>
            
            {/* Recent Sales Table */}
            <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 p-6">{t('reportsPage.recentTransactions')}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportsPage.invoiceId')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportsPage.date')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportsPage.itemsCount')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportsPage.paymentMethod')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reportsPage.total')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.slice(0, 10).map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sale.id.slice(-6)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(sale.date, 'MMM d, yyyy h:mm a')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.items.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentMethod}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₹{sale.finalTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;