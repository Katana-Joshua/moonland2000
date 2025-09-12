import React, { useState, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Search, FileText, Calendar as CalendarIcon, Trash2, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Receipt from '@/components/common/Receipt';
import { DatePicker } from '@/components/ui/datepicker';
import { format, isSameDay } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TransactionHistory = () => {
  const { sales, deleteSale } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const receiptRef = useRef();
  const saleToPrintRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
      if (saleToPrintRef.current) {
        toast({ title: 'Receipt Printed', description: `Reprinted receipt #${saleToPrintRef.current.receiptNumber}` });
        saleToPrintRef.current = null;
      }
      setSelectedSale(null);
    },
  });

  const onReprint = (sale) => {
    saleToPrintRef.current = sale;
    setSelectedSale(sale);
    setTimeout(() => handlePrint(), 100);
  };

  const onDelete = (saleId) => {
    deleteSale(saleId);
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
          sale.customerInfo?.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerInfo?.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.cashierName?.toLowerCase().includes(searchTerm.toLowerCase());
        
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
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                <Input
                  type="text"
                  placeholder="Search receipts, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
                />
              </div>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
          </div>
          <CardDescription className="text-amber-200/60 px-6 pt-2">
            View all sales, including customer details and remarks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Cashier</TableHead>
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
                      <TableCell>{new Date(sale.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{sale.customerInfo?.name || 'N/A'}</div>
                        <div className="text-xs text-amber-200/70">{sale.customerInfo?.contact || ''}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-amber-200/80" title={sale.customerInfo?.remarks}>
                        {sale.customerInfo?.remarks || 'N/A'}
                      </TableCell>
                      <TableCell>{sale.cashierName}</TableCell>
                      <TableCell className="text-right font-bold">UGX {sale.total.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'paid' ? 'bg-green-800/50 text-green-300' : 
                          sale.status === 'partially-paid' ? 'bg-yellow-800/50 text-yellow-300' :
                          'bg-red-800/50 text-red-300'
                        }`}>
                          {sale.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReprint(sale)}
                          className="border-amber-700 hover:bg-amber-900/50"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Reprint
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="bg-red-800/70 hover:bg-red-700/70">
                               <Trash2 className="w-4 h-4 mr-2" />
                               Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-effect border-red-800/50">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-100">Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-red-200/80">
                                This action cannot be undone. This will permanently delete the transaction
                                with receipt number <strong className="text-red-100">{sale.receiptNumber}</strong>. 
                                This could affect accounting reports.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(sale.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Yes, delete transaction
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-amber-200/60 h-24">
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