
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePOS } from '@/contexts/POSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const CustomerDebtHistory = () => {
  const { customerName } = useParams();
  const navigate = useNavigate();
  const { sales, payCreditSale } = usePOS();

  const customerSales = useMemo(() => {
    return sales
      .filter(sale => sale.paymentMethod === 'credit' && sale.customerInfo?.name === customerName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [sales, customerName]);

  const summary = useMemo(() => {
    return customerSales.reduce((acc, sale) => {
      acc.totalDebt += sale.total;
      if (sale.status === 'paid') {
        acc.totalPaid += sale.total;
      } else {
        acc.totalUnpaid += sale.total;
      }
      return acc;
    }, { totalDebt: 0, totalPaid: 0, totalUnpaid: 0 });
  }, [customerSales]);

  const handlePay = (saleId) => {
    payCreditSale(saleId);
    toast({
        title: "Debt Paid",
        description: `Marked debt for sale #${saleId.split('-')[1]} as paid.`,
    })
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin', { state: { selectedTab: 'credit' } })}
            className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Debts
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 tracking-tight">
            Debt History for {decodeURIComponent(customerName)}
          </h1>
          <p className="text-amber-200/80 mt-1">
            View all credit transactions for this customer.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-effect border-red-800/50">
                <CardHeader>
                    <CardTitle className="text-red-300">Outstanding Debt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-red-400">UGX {summary.totalUnpaid.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card className="glass-effect border-green-800/50">
                <CardHeader>
                    <CardTitle className="text-green-300">Total Paid</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-400">UGX {summary.totalPaid.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card className="glass-effect border-amber-800/50">
                <CardHeader>
                    <CardTitle className="text-amber-300">Lifetime Debt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-amber-100">UGX {summary.totalDebt.toLocaleString()}</p>
                </CardContent>
            </Card>
        </div>


        <Card className="glass-effect border-amber-800/50">
          <CardHeader>
            <CardTitle className="text-amber-100">Transaction List</CardTitle>
            <CardDescription className="text-amber-200/80">
              All credit sales are listed below, from most recent to oldest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSales.length > 0 ? (
                    customerSales.map((sale, index) => (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-amber-800/30"
                      >
                        <TableCell>{new Date(sale.timestamp).toLocaleDateString('en-US', { timeZone: 'Africa/Kampala' })}</TableCell>
                        <TableCell className="font-semibold">{sale.receiptNumber}</TableCell>
                        <TableCell className="text-right font-bold">UGX {sale.total.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          {sale.status === 'paid' ? (
                            <span className="flex items-center justify-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" /> Paid
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2 text-red-400">
                              <Clock className="w-4 h-4" /> Unpaid
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {sale.status === 'unpaid' && (
                            <Button size="sm" onClick={() => handlePay(sale.id)}>
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-amber-200/60 h-24">
                        No credit sales found for this customer.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDebtHistory;
