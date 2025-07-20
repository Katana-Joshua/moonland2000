import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ProfitAndLoss = () => {
  const { profitAndLoss } = useAccounting();
  const { revenue, cogs, grossProfit, operatingExpenses, netProfit } = profitAndLoss;

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  const data = [
    { name: 'Revenue', value: revenue, color: '#34d399' },
    { name: 'COGS', value: cogs, color: '#f87171' },
    { name: 'Gross Profit', value: grossProfit, color: '#60a5fa' },
    { name: 'Expenses', value: operatingExpenses, color: '#fb923c' },
    { name: 'Net Profit', value: netProfit, color: netProfit >= 0 ? '#4ade80' : '#ef4444' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <Card className="md:col-span-3 glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <BarChart2 className="w-6 h-6 mr-2" />
            Profit & Loss Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-400"/>Total Revenue</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(revenue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-red-400"/>Cost of Goods Sold (COGS)</TableCell>
                <TableCell className="text-right font-mono">({formatCurrency(cogs)})</TableCell>
              </TableRow>
              <TableRow className="font-bold border-t-2 border-amber-700">
                <TableCell>Gross Profit</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(grossProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-red-400"/>Operating Expenses</TableCell>
                <TableCell className="text-right font-mono">({formatCurrency(operatingExpenses)})</TableCell>
              </TableRow>
              <TableRow className={`font-bold text-lg border-t-2 border-amber-700 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TableCell className="flex items-center"><DollarSign className="w-5 h-5 mr-2"/>Net Profit</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(netProfit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100 text-base">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" stroke="#a8a29e" width={80} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', color: '#f5f5f4' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="value" barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitAndLoss;