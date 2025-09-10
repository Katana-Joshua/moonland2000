import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, User, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PurchaseOrderForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date(),
    expected_delivery_date: null,
    notes: '',
    items: [{ name: '', description: '', quantity: 1, unit_price: 0 }]
  });
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier_id) {
      toast({ title: 'Validation Error', description: 'Please select a supplier.', variant: 'destructive' });
      return;
    }

    if (formData.items.some(item => !item.name || item.quantity <= 0 || item.unit_price <= 0)) {
      toast({ title: 'Validation Error', description: 'Please fill in all item details correctly.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const poData = {
        ...formData,
        total_amount: calculateTotal(),
        items: formData.items.map(item => ({
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: 'Purchase order created successfully.' });
        onSubmit(data);
      } else {
        throw new Error('Failed to create purchase order');
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({ title: 'Error', description: 'Failed to create purchase order.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-amber-200">Supplier *</Label>
            <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
              <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-200">Order Date *</Label>
            <DatePicker 
              date={formData.order_date} 
              setDate={(date) => setFormData({ ...formData, order_date: date })} 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-amber-200">Expected Delivery Date</Label>
            <DatePicker 
              date={formData.expected_delivery_date} 
              setDate={(date) => setFormData({ ...formData, expected_delivery_date: date })} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-amber-200">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              rows={4}
            />
          </div>
        </div>
      </div>

      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Package className="w-5 h-5 mr-2" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-black/20 rounded-lg">
              <div className="space-y-1">
                <Label className="text-amber-200 text-xs">Item Name *</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="bg-black/30 border-amber-800/50 text-amber-100"
                  placeholder="Enter item name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-amber-200 text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="bg-black/30 border-amber-800/50 text-amber-100"
                  placeholder="Item description"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-amber-200 text-xs">Quantity *</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="bg-black/30 border-amber-800/50 text-amber-100"
                  min="1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-amber-200 text-xs">Unit Price *</Label>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="bg-black/30 border-amber-800/50 text-amber-100"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" onClick={addItem} variant="outline" className="border-amber-800/50 text-amber-100">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>

          <div className="pt-4 border-t border-amber-800/30">
            <div className="flex justify-between items-center text-lg font-semibold text-amber-100">
              <span>Total Amount:</span>
              <span>UGX {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
          {isLoading ? 'Creating...' : 'Create Purchase Order'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-amber-800/50 text-amber-100">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
