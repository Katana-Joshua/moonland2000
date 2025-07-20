
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Package, TrendingUp, Barcode } from 'lucide-react';

const InventoryItemCard = ({ item, onEdit, onDelete }) => {
  const profitMargin = item.price && item.costPrice ? ((item.price - item.costPrice) / item.price) * 100 : 0;

  // Debug image data
  console.log('InventoryItemCard - Item:', item.name, 'Image:', item.image ? 'Has image' : 'No image');
  if (item.image) {
    const imageUrl = item.image.startsWith('data:') ? item.image : 
                     item.image.startsWith('/uploads/') ? `http://localhost:5000${item.image}` : 
                     `data:image/jpeg;base64,${item.image}`;
    console.log('  Image URL:', imageUrl);
  }

  return (
    <Card className="glass-effect border-amber-800/50 hover:border-amber-600/50 transition-colors h-full flex flex-col">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-amber-100">{item.name}</h3>
            <p className="text-sm text-amber-200/80">{item.category}</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 p-0 hover:bg-amber-950/50"
            >
              <Edit className="w-4 h-4 text-amber-400" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-red-950/50"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>

        {item.image ? (
          <img
            src={item.image.startsWith('data:') ? item.image : 
                 item.image.startsWith('/uploads/') ? 
                   (() => {
                     const directUrl = `http://localhost:5000${item.image}`;
                     const proxyUrl = `http://localhost:5000/api/images${item.image.replace('/uploads', '')}`;
                     console.log('Trying direct URL:', directUrl);
                     console.log('Fallback proxy URL:', proxyUrl);
                     return directUrl;
                   })() : 
                 `data:image/jpeg;base64,${item.image}`}
            alt={item.name}
            className="w-full h-32 object-cover rounded-md mb-3"
            onError={(e) => {
              console.error('Image failed to load for:', item.name, 'URL:', e.target.src);
              // Try proxy URL as fallback
              if (e.target.src.includes('/uploads/') && !e.target.src.includes('/api/images/')) {
                const proxyUrl = e.target.src.replace('/uploads/', '/api/images/');
                console.log('Trying proxy URL as fallback:', proxyUrl);
                e.target.src = proxyUrl;
              } else {
                e.target.style.display = 'none';
              }
            }}
            onLoad={() => console.log('Image loaded successfully for:', item.name)}
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center rounded-md mb-3">
            <Package className="w-12 h-12 text-amber-500/50" />
          </div>
        )}

        <div className="space-y-2 mt-auto">
          <div className="flex justify-between">
            <span className="text-amber-200/80">Cost:</span>
            <span className="font-semibold text-amber-100">UGX {item.costPrice?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-200/80">Price:</span>
            <span className="font-semibold text-amber-100">UGX {item.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-200/80">Stock:</span>
            <span className={`font-semibold ${item.stock <= item.lowStockAlert ? 'text-red-400' : 'text-amber-100'}`}>
              {item.stock}
            </span>
          </div>
          {item.barcode && (
            <div className="flex items-center text-amber-200/60 text-sm">
              <Barcode className="w-4 h-4 mr-1" />
              {item.barcode}
            </div>
          )}
          {item.stock <= item.lowStockAlert && (
            <div className="flex items-center text-red-400 text-sm">
              <Package className="w-4 h-4 mr-1" />
              Low Stock Alert
            </div>
          )}
          {item.price && item.costPrice && (
            <div className="flex items-center text-green-400 text-sm pt-2 border-t border-amber-800/30">
              <TrendingUp className="w-4 h-4 mr-1" />
              Profit Margin: {profitMargin.toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryItemCard;
