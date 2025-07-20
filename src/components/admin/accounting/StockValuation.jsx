import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList } from 'lucide-react';

const StockValuation = () => {
  const { stockValuation } = useAccounting();

  const totalStockValue = stockValuation.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (amount) => amount.toLocaleString();

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <ClipboardList className="w-6 h-6 mr-2" />
          Stock Valuation Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost Price (UGX)</TableHead>
                <TableHead className="text-right">Total Value (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockValuation.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(item.costPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(item.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 pt-4 border-t border-amber-800/50 flex justify-end items-center">
          <div className="text-right">
            <p className="text-amber-200/80">Total Stock Value</p>
            <p className="text-xl font-bold text-amber-100">UGX {formatCurrency(totalStockValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockValuation;