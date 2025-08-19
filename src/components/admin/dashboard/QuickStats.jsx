import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';

const QuickStats = ({ sales, expenses, setActiveTab }) => {
  // Debug logging
  console.log('QuickStats rendered with:', { sales, expenses });

  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.timestamp).toDateString() === today);
  const todayExpenses = expenses.filter(expense => new Date(expense.timestamp).toDateString() === today);
  
  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Fix: Calculate net profit using actual profit from sales, not total sales
  const totalProfit = todaySales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const netProfit = totalProfit - totalExpenses;
  
  const transactionCount = todaySales.length;

  console.log('QuickStats calculated values:', { 
    todaySales, 
    todayExpenses, 
    totalSales, 
    totalExpenses, 
    totalProfit,
    netProfit, 
    transactionCount 
  });

  const stats = [
    {
      title: 'Today\'s Sales',
      value: `UGX ${totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/50'
    },
    {
      title: 'Today\'s Expenses',
      value: `UGX ${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-700/50'
    },
    {
      title: 'Net Profit',
      value: `UGX ${netProfit.toLocaleString()}`,
      icon: DollarSign,
      color: netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: netProfit >= 0 ? 'bg-green-900/20' : 'bg-red-900/20',
      borderColor: netProfit >= 0 ? 'border-green-700/50' : 'border-red-700/50'
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="h-full"
        >
          <Card className={`glass-effect ${stat.bgColor} ${stat.borderColor} hover:scale-105 transition-transform duration-200 h-full flex flex-col`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium text-amber-200">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-2xl font-bold text-amber-100 text-center">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
