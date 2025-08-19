import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ShoppingCart, DollarSign } from 'lucide-react';

const RecentActivity = ({ sales, expenses }) => {
  // Combine and sort recent activities
  const recentActivities = [
    ...sales.slice(-5).map(sale => ({
      type: 'sale',
      amount: sale.total,
      description: `${sale.items.length} items sold`,
      timestamp: sale.timestamp,
      icon: ShoppingCart,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    })),
    ...expenses.slice(-5).map(expense => ({
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      timestamp: expense.timestamp,
      icon: DollarSign,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, 8);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="glass-effect border-amber-800/50 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-amber-100 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-amber-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 h-full flex flex-col items-center justify-center">
            <Clock className="w-12 h-12 text-amber-400/50 mb-4" />
            <p className="text-amber-200/60">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={`${activity.type}-${activity.timestamp}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-black/20 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-amber-200/60">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${activity.type === 'sale' ? 'text-green-400' : 'text-red-400'}`}>
                    {activity.type === 'sale' ? '+' : '-'}UGX {activity.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
