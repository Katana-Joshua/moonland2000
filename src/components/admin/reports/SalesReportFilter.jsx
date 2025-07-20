import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePOS } from '@/contexts/POSContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Search, RotateCcw, Filter, Hash } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker.jsx';

const SalesReportFilter = ({ onFilter }) => {
  const { sales, expenses } = usePOS();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [receiptNumber, setReceiptNumber] = useState('');

  const applyFilters = () => {
    let filteredS = [...sales];
    let filteredE = [...expenses];

    // Receipt number filter (overrides other filters for sales)
    if (receiptNumber.trim()) {
      const foundSale = sales.find(s => s.receiptNumber?.toString() === receiptNumber.trim());
      filteredS = foundSale ? [foundSale] : [];
      // Expenses are not tied to receipt numbers, so we clear them
      filteredE = [];
      onFilter({ sales: filteredS, expenses: filteredE });
      toast({
        title: 'Filter Applied',
        description: `Found ${filteredS.length} sale(s) for receipt #${receiptNumber.trim()}`,
      });
      return;
    }

    // Date filter
    let startDateTime = null;
    let endDateTime = null;

    if (startDate) {
      startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
    }
    
    if (startDateTime && endDateTime && startDateTime > endDateTime) {
        toast({
            title: 'Error',
            description: 'Start date cannot be after end date.',
            variant: 'destructive',
        });
        return;
    }

    if (startDateTime || endDateTime) {
      filteredS = filteredS.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        const afterStart = startDateTime ? saleDate >= startDateTime : true;
        const beforeEnd = endDateTime ? saleDate <= endDateTime : true;
        return afterStart && beforeEnd;
      });

      filteredE = filteredE.filter(expense => {
        const expenseDate = new Date(expense.timestamp);
        const afterStart = startDateTime ? expenseDate >= startDateTime : true;
        const beforeEnd = endDateTime ? expenseDate <= endDateTime : true;
        return afterStart && beforeEnd;
      });
    }


    // Payment method filter
    if (paymentMethod !== 'all') {
      filteredS = filteredS.filter(sale => sale.paymentMethod === paymentMethod);
    }

    onFilter({ sales: filteredS, expenses: filteredE });

    toast({
      title: 'Filters Applied',
      description: `Found ${filteredS.length} sales and ${filteredE.length} expenses`,
    });
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPaymentMethod('all');
    setReceiptNumber('');
    onFilter({ sales, expenses });
    toast({
      title: 'Filters Cleared',
      description: 'Showing all records.',
    });
  };

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <Filter className="w-5 h-5 mr-2" />
          Filter Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <Label htmlFor="receiptNumber" className="text-amber-200 flex items-center mb-2">
              <Hash className="w-4 h-4 mr-2" />
              Filter by Receipt Number
            </Label>
            <Input
              id="receiptNumber"
              placeholder="Enter a single receipt number to find a specific sale"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
        </div>
        <div className="text-center my-2 text-amber-200/70 text-sm">OR</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-200 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Label>
            <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date"/>
            <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date"/>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={applyFilters} className="w-full bg-amber-600 hover:bg-amber-700">
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full border-amber-800/50 text-amber-100">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesReportFilter;