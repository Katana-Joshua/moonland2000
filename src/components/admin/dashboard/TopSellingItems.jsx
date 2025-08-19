import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package } from 'lucide-react';

const TopSellingItems = ({ sales, inventory }) => {
  // Calculate top selling items from sales data
  const itemSales = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (itemSales[item.id]) {
        itemSales[item.id].quantity += item.quantity;
        itemSales[item.id].revenue += item.price * item.quantity;
      } else {
        itemSales[item.id] = {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <Card className="glass-effect border-amber-800/50 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-amber-100 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
          Top Selling Items
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {topItems.length === 0 ? (
          <div className="text-center py-8 h-full flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-amber-400/50 mb-4" />
            <p className="text-amber-200/60">No sales data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-amber-800/30 hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-amber-900/50 rounded-full flex items-center justify-center text-amber-300 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-amber-100 truncate">{item.name}</p>
                    <p className="text-sm text-amber-200/70">
                      {item.quantity} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-amber-300">
                    UGX {item.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-200/60">
                    {((item.revenue / topItems.reduce((sum, i) => sum + i.revenue, 0)) * 100).toFixed(1)}%
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

export default TopSellingItems;
