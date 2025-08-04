import React from 'react';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote, ArrowUp, ArrowDown, Wallet, Coins } from 'lucide-react';

const DailyClosingReport = () => {
  const { sales, expenses } = usePOS();

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const todayExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === today);

  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const momoSales = todaySales.filter(s => s.paymentMethod === 'momo').reduce((sum, s) => sum + s.total, 0);
  const airtelSales = todaySales.filter(s => s.paymentMethod === 'airtel').reduce((sum, s) => sum + s.total, 0);
  const bankDepositSales = todaySales.filter(s => s.paymentMethod === 'bank_deposit').reduce((sum, s) => sum + s.total, 0);
  const creditCardSales = todaySales.filter(s => s.paymentMethod === 'credit_card').reduce((sum, s) => sum + s.total, 0);
  const creditSales = todaySales.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netCash = cashSales - totalExpenses;

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <Banknote className="w-6 h-6 mr-2" />
          Daily Closing Report ({new Date().toLocaleDateString()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center"><ArrowUp className="w-5 h-5 mr-2"/>Cash Inflow</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Total Sales</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Cash Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Momo Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(momoSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Airtel Money Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(airtelSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Bank Deposit Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(bankDepositSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Credit Card Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(creditCardSales)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Credit Sales</TableCell>
                  <TableCell className="text-right">{formatCurrency(creditSales)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center"><ArrowDown className="w-5 h-5 mr-2"/>Cash Outflow</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalExpenses)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-amber-800/50">
          <div className="flex justify-between items-center text-xl font-bold text-amber-100 p-4 glass-effect rounded-lg">
            <span className="flex items-center"><Wallet className="w-6 h-6 mr-2"/>Net Cash in Hand</span>
            <span className={netCash >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(netCash)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyClosingReport;