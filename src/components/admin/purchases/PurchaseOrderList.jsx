import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Package, Calendar, User, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchase-orders`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast({ title: 'Error', description: 'Failed to load purchase orders.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-800/50 text-yellow-300';
      case 'ordered': return 'bg-blue-800/50 text-blue-300';
      case 'received': return 'bg-green-800/50 text-green-300';
      case 'cancelled': return 'bg-red-800/50 text-red-300';
      default: return 'bg-gray-800/50 text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-amber-800/50">
        <CardContent className="p-6">
          <div className="text-center text-amber-200">Loading purchase orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Package className="w-5 h-5 mr-2" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-semibold">{po.po_number}</TableCell>
                      <TableCell>{po.supplier_name}</TableCell>
                      <TableCell>{formatDate(po.order_date)}</TableCell>
                      <TableCell>{po.expected_delivery_date ? formatDate(po.expected_delivery_date) : 'N/A'}</TableCell>
                      <TableCell>UGX {po.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-100">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-amber-400/50" />
              <h3 className="mt-4 text-lg font-semibold text-amber-300">No Purchase Orders</h3>
              <p className="mt-2 text-amber-200/80">Create your first purchase order to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderList;
