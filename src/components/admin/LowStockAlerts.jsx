import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePOS } from '@/contexts/POSContext';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';

const LowStockAlerts = () => {
  const { getLowStockItems } = usePOS();
  const lowStockItems = getLowStockItems();

  const handleReorder = (item) => {
    toast({
      title: "Reorder Initiated",
      description: "🚧 Automatic reordering isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const handleUpdateStock = (item) => {
    toast({
      title: "Quick Stock Update",
      description: "🚧 Quick stock updates aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="text-2xl font-bold text-amber-100">Low Stock Alerts</h2>
        <div className="flex items-center text-red-400 self-start sm:self-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="font-semibold">{lowStockItems.length} Items Need Attention</span>
        </div>
      </div>

      {lowStockItems.length === 0 ? (
        <Card className="glass-effect border-amber-800/50">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-amber-100 mb-2">All Stock Levels Good!</h3>
            <p className="text-amber-200/60">No items are currently below their low stock alert threshold.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lowStockItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-red-800/50 hover:border-red-600/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-amber-100">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    {item.name}
                  </CardTitle>
                  <p className="text-sm text-amber-200/80">{item.category}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/80">Current Stock:</span>
                      <span className="font-bold text-red-400">{item.stock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/80">Alert Threshold:</span>
                      <span className="text-amber-100">{item.lowStockAlert}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/80">Price:</span>
                      <span className="text-amber-100">UGX {item.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((item.stock / item.lowStockAlert) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReorder(item)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Reorder
                    </Button>
                    <Button
                      onClick={() => handleUpdateStock(item)}
                      variant="outline"
                      className="flex-1 border-amber-800/50 text-amber-100 text-xs"
                    >
                      <Package className="w-3 h-3 mr-1" />
                      Update
                    </Button>
                  </div>

                  <div className="text-xs text-red-400 bg-red-950/20 p-2 rounded border border-red-800/30">
                    <strong>Alert:</strong> Stock is {item.lowStockAlert - item.stock} units below threshold
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;