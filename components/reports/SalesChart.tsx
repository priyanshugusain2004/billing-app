
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sale } from '../../types';
import { format } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';

interface SalesChartProps {
    sales: Sale[];
    timeframe: 'daily' | 'weekly' | 'monthly';
}

const SalesChart: React.FC<SalesChartProps> = ({ sales, timeframe }) => {
    const { t } = useTranslation();

    const aggregateData = () => {
        const dataMap = new Map<string, number>();

        sales.forEach(sale => {
            let key = '';
            if (timeframe === 'daily') {
                key = format(sale.date, 'MMM d');
            } else if (timeframe === 'weekly') {
                key = `Week of ${format(sale.date, 'MMM d')}`; // Simplified for example
            } else { // monthly
                key = format(sale.date, 'MMM yyyy');
            }

            const currentTotal = dataMap.get(key) || 0;
            dataMap.set(key, currentTotal + sale.finalTotal);
        });
        
        return Array.from(dataMap, ([name, total]) => ({ name, totalSales: total }));
    };

    const data = aggregateData();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, t('salesChart.tooltipLabel')]} />
                    <Legend />
                    <Bar dataKey="totalSales" name={t('salesChart.tooltipLabel')} fill="#4CAF50" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesChart;