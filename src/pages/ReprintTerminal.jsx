import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, Filter, RotateCcw, Clock, Hash, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Receipt from '@/components/common/Receipt';
import { DatePicker } from '@/components/ui/datepicker.jsx';

const ReprintTerminal = () => {
  const { staff, sales } = usePOS();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const receiptRef = useRef();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
      toast({ title: 'Receipt Printed', description: `Reprinted receipt #${selectedSale.receiptNumber}` });
      setSelectedSale(null);
    },
  });

  const onReprint = (sale) => {
    setSelectedSale(sale);
    setTimeout(() => handlePrint(), 100);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
    toast({
      title: 'Filters Cleared',
      description: 'Showing all transactions for the selected cashier.',
    });
  };

  const cashierSales = useMemo(() => {
    if (!selectedCashier) return [];
    
    let filtered = sales.filter(sale => sale.cashierName === selectedCashier);

    let startDateTime = null;
    if (startDate) {
      startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      if (startTime) {
        const [hours, minutes] = startTime.split(':');
        startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
    }

    let endDateTime = null;
    if (endDate) {
      endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      if (endTime) {
        const [hours, minutes] = endTime.split(':');
        endDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
    }

    if (startDateTime || endDateTime) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        const afterStart = startDateTime ? saleDate >= startDateTime : true;
        const beforeEnd = endDateTime ? saleDate <= endDateTime : true;
        return afterStart && beforeEnd;
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [sales, selectedCashier, startDate, endDate, startTime, endTime]);

  const cashierStats = useMemo(() => {
    if (!selectedCashier) return { totalSales: 0, transactionCount: 0 };
    return {
      totalSales: cashierSales.reduce((sum, sale) => sum + sale.total, 0),
      transactionCount: cashierSales.length,
    };
  }, [cashierSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-amber-800/50 text-amber-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <h1 className="text-3xl font-bold text-amber-100">Reprint Receipts</h1>
        </div>
      </div>

      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100">Select Cashier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select onValueChange={setSelectedCashier} value={selectedCashier || ''}>
              <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                <SelectValue placeholder="Select a cashier to view their receipts..." />
              </SelectTrigger>
              <SelectContent>
                {staff.map(member => (
                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCashier && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="glass-effect border-amber-800/50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-100">
                <Filter className="w-5 h-5 mr-3 text-amber-400" />
                Filter by Time Frame
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date" />
                <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-amber-200/80 text-xs flex items-center"><Clock className="w-3 h-3 mr-1"/>Start Time</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-black/20 border-amber-800/50 text-amber-100" />
                </div>
                <div className="space-y-1">
                  <Label className="text-amber-200/80 text-xs flex items-center"><Clock className="w-3 h-3 mr-1"/>End Time</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-black/20 border-amber-800/50 text-amber-100" />
                </div>
              </div>
              <Button onClick={clearFilters} variant="outline" size="sm" className="border-amber-800/50 text-amber-100">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Time Filters
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-effect border-green-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-200/80">Total Sales Value (Filtered)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{formatCurrency(cashierStats.totalSales)}</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-200/80">Total Transactions (Filtered)</CardTitle>
                <Hash className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{cashierStats.transactionCount}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-effect border-amber-800/50">
            <CardHeader>
              <CardTitle className="text-amber-100">Receipts from {selectedCashier}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashierSales.length > 0 ? (
                      cashierSales.map((sale, index) => (
                        <motion.tr
                          key={sale.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-amber-800/30"
                        >
                          <TableCell className="font-semibold">{sale.receiptNumber}</TableCell>
                          <TableCell>{new Date(sale.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{sale.customerInfo?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(sale.total)}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              sale.status === 'paid' ? 'bg-green-800/50 text-green-300' :
                              sale.status === 'partially-paid' ? 'bg-yellow-800/50 text-yellow-300' :
                              'bg-red-800/50 text-red-300'
                            }`}>
                              {sale.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReprint(sale)}
                              className="border-amber-700 hover:bg-amber-900/50"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Reprint
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-amber-200/60 h-24">
                          No receipts found for this cashier in the selected time frame.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="hidden">
        <Receipt ref={receiptRef} sale={selectedSale} isDuplicate={true} />
      </div>
    </div>
  );
};

export default ReprintTerminal;
