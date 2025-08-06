import React, { useState, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Search, FileText, Calendar as CalendarIcon, Trash2, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Receipt from '@/components/common/Receipt';
import { DatePicker } from '@/components/ui/datepicker';
import { format, isSameDay } from 'date-fns';

const TransactionHistory = () => {
  const { sales, deleteSale } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [deletingSaleId, setDeletingSaleId] = useState(null);
  const receiptRef = useRef();

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

  const handleDeleteSale = async (sale) => {
    if (!window.confirm(`Are you sure you want to delete sale #${sale.receiptNumber}? This action cannot be undone and will restore inventory stock.`)) {
      return;
    }

    setDeletingSaleId(sale.id);
    try {
      await deleteSale(sale.id);
    } finally {
      setDeletingSaleId(null);
    }
  };

  const formatItemsList = (items) => {
    if (!items || items.length === 0) return 'No items';
    
    return items.map(item => 
      `${item.name} (${item.quantity}x)`
    ).join(', ');
  };

  const filteredSales = useMemo(() => {
    return sales
      .filter(sale => {
        const matchesSearch =
          sale.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.cashierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.items && sale.items.some(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase())
          ));
        
        const matchesDate = selectedDate ? isSameDay(new Date(sale.timestamp), selectedDate) : true;

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [sales, searchTerm, selectedDate]);

  return (
    <>
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 mr-3 text-amber-400" />
              <CardTitle className="text-amber-100">Transaction History</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                <Input
                  type="text"
                  placeholder="Search receipt #, customer, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
                />
              </div>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale, index) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-amber-800/30"
                    >
                      <TableCell className="font-semibold">{sale.receiptNumber}</TableCell>
                      <TableCell>{new Date(sale.timestamp).toLocaleString('en-US', { timeZone: 'Africa/Kampala' })}</TableCell>
                      <TableCell>{sale.customerInfo?.name || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="text-xs text-amber-200/80 truncate" title={formatItemsList(sale.items)}>
                            {formatItemsList(sale.items)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">UGX {sale.total.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'paid' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'
                        }`}>
                          {sale.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReprint(sale)}
                            className="border-amber-700 hover:bg-amber-900/50"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Reprint
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSale(sale)}
                            disabled={deletingSaleId === sale.id}
                            className="border-red-700 hover:bg-red-950/50 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingSaleId === sale.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-amber-200/60 h-24">
                      No matching transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="hidden">
        <Receipt ref={receiptRef} sale={selectedSale} isDuplicate={true} />
      </div>
    </>
  );
};

export default TransactionHistory;