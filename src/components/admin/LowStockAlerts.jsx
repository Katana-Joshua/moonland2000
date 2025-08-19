import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePOS } from '@/contexts/POSContext';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { buildImageUrl } from '@/lib/api';

const LowStockAlerts = () => {
  const { getLowStockItems, updateInventoryItem } = usePOS();
  const lowStockItems = getLowStockItems();

  const handleReorder = (item) => {
    toast({
      title: "Coming Soon",
      description: "Reorder with service providers will be available in a future update."
    });
  };

  const handleUpdateStock = async (item) => {
    const input = prompt(`Enter quantity to add to ${item.name} (current stock: ${item.stock}):`, "0");
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a positive number.",
        variant: "destructive"
      });
      return;
    }
    const newStock = (item.stock || 0) + qty;
    try {
      await updateInventoryItem(item.id, { ...item, stock: newStock });
      toast({
        title: "Stock Updated",
        description: `${qty} units added to ${item.name}. New stock: ${newStock}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update stock.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-effect border-amber-800/50 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-amber-100 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
          Low Stock Alerts
        </CardTitle>
        <div className="flex items-center text-red-400 mt-2">
          <span className="font-semibold text-sm">{lowStockItems.length} Items Need Attention</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 h-full flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-amber-100 mb-2">All Stock Levels Good!</h3>
            <p className="text-amber-200/60">No items are currently below their low stock alert threshold.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lowStockItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 rounded-lg border border-red-800/30 p-3 hover:border-red-600/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={buildImageUrl(item.image)}
                        alt={item.name}
                        loading="lazy"
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center rounded-md">
                        <Package className="w-6 h-6 text-amber-500/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-amber-100 truncate">{item.name}</h4>
                    <p className="text-sm text-amber-200/80">{item.category}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-200/60">Stock:</span>
                        <span className="font-bold text-red-400">{item.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-200/60">Threshold:</span>
                        <span className="text-amber-100">{item.lowStockAlert}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((item.stock / item.lowStockAlert) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => handleReorder(item)}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-xs px-2 py-1 h-6"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Reorder
                      </Button>
                      <Button
                        onClick={() => handleUpdateStock(item)}
                        variant="outline"
                        size="sm"
                        className="border-amber-800/50 text-amber-100 text-xs px-2 py-1 h-6"
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;