import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-amber-700/50">
        <p className="label text-amber-200">{`${label}`}</p>
        <p className="intro text-amber-100 font-bold">{`Sales: UGX ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ sales }) => {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(startOfDay(d), 'EEE, MMM d');
    });

    const dailySales = sales.reduce((acc, sale) => {
      const date = format(startOfDay(new Date(sale.timestamp)), 'EEE, MMM d');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += sale.total;
      return acc;
    }, {});

    return last7Days.map(date => ({
      date,
      sales: dailySales[date] || 0,
    }));
  }, [sales]);

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="text-amber-100 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-amber-400" />
          Weekly Sales Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(217, 119, 6, 0.2)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#fcd34d' }} 
                axisLine={{ stroke: '#92400e' }}
                tickLine={{ stroke: '#92400e' }}
                tickFormatter={(str) => str.substring(0, 3)}
              />
              <YAxis 
                tick={{ fill: '#fcd34d' }} 
                axisLine={{ stroke: '#92400e' }}
                tickLine={{ stroke: '#92400e' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245, 158, 11, 0.5)', strokeWidth: 2 }} />
              <Legend wrapperStyle={{ color: '#fde68a' }} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                activeDot={{ r: 8, stroke: '#fde68a', fill: '#f59e0b' }}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart; 