import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, TrendingUp, TrendingDown, RotateCcw, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const StockMovementReport = () => {
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadStockMovements = async () => {
    if (!selectedItem) {
      toast({ title: 'Validation Error', description: 'Please select an item first.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        item_id: selectedItem,
        ...(startDate && { start_date: startDate.toISOString().split('T')[0] }),
        ...(endDate && { end_date: endDate.toISOString().split('T')[0] })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock-movements?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStockMovements(data);
      }
    } catch (error) {
      console.error('Error loading stock movements:', error);
      toast({ title: 'Error', description: 'Failed to load stock movements.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedItem('');
    setStartDate(null);
    setEndDate(null);
    setStockMovements([]);
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'sale': return 'bg-red-800/50 text-red-300';
      case 'purchase': return 'bg-green-800/50 text-green-300';
      case 'return': return 'bg-blue-800/50 text-blue-300';
      case 'adjustment': return 'bg-yellow-800/50 text-yellow-300';
      case 'transfer': return 'bg-purple-800/50 text-purple-300';
      default: return 'bg-gray-800/50 text-gray-300';
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'sale': return <TrendingDown className="w-4 h-4" />;
      case 'purchase': return <TrendingUp className="w-4 h-4" />;
      case 'return': return <RotateCcw className="w-4 h-4" />;
      case 'adjustment': return <Package className="w-4 h-4" />;
      case 'transfer': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const selectedItemData = inventory.find(item => item.id === selectedItem);

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Filter className="w-5 h-5 mr-2" />
            Stock Movement Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-amber-200">Select Item *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Current Stock: {item.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200">Start Date</Label>
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200">End Date</Label>
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={loadStockMovements} disabled={!selectedItem || isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? 'Loading...' : 'Load Movements'}
            </Button>
            <Button onClick={clearFilters} variant="outline" className="border-amber-800/50 text-amber-100">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedItemData && (
        <Card className="glass-effect border-blue-800/50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-100">
              <Package className="w-5 h-5 mr-2" />
              Item Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-blue-200/80 text-sm">Item Name</Label>
                <p className="text-blue-100 font-semibold">{selectedItemData.name}</p>
              </div>
              <div>
                <Label className="text-blue-200/80 text-sm">Current Stock</Label>
                <p className="text-blue-100 font-semibold">{selectedItemData.stock} units</p>
              </div>
              <div>
                <Label className="text-blue-200/80 text-sm">Unit Price</Label>
                <p className="text-blue-100 font-semibold">UGX {selectedItemData.price.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stockMovements.length > 0 && (
        <Card className="glass-effect border-amber-800/50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-100">
              <Calendar className="w-5 h-5 mr-2" />
              Stock Movement History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Movement Type</TableHead>
                    <TableHead>Quantity Change</TableHead>
                    <TableHead>Previous Stock</TableHead>
                    <TableHead>New Stock</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getMovementTypeColor(movement.movement_type)}>
                          <div className="flex items-center gap-1">
                            {getMovementIcon(movement.movement_type)}
                            {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className={movement.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </TableCell>
                      <TableCell>{movement.previous_stock}</TableCell>
                      <TableCell className="font-semibold">{movement.new_stock}</TableCell>
                      <TableCell>
                        {movement.reference_type} #{movement.reference_id}
                      </TableCell>
                      <TableCell>{movement.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedItem && stockMovements.length === 0 && !isLoading && (
        <Card className="glass-effect border-amber-800/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-amber-400/50" />
              <h3 className="mt-4 text-lg font-semibold text-amber-300">No Stock Movements Found</h3>
              <p className="mt-2 text-amber-200/80">
                No stock movements found for the selected item and date range.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockMovementReport;
