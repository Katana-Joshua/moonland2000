import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins as HandCoins, ArrowRight, ArrowLeft } from 'lucide-react';

const ReceivablesPayables = () => {
  const { ledgers } = useAccounting();

  const receivables = ledgers['Accounts Receivable']?.transactions.filter(tx => tx.balance !== 0) || [];
  const payables = ledgers['Accounts Payable']?.transactions.filter(tx => tx.balance !== 0) || [];

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <ArrowRight className="w-6 h-6 mr-2" />
            Accounts Receivable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.length > 0 ? receivables.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.narration}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={2} className="text-center">No outstanding receivables.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <ArrowLeft className="w-6 h-6 mr-2" />
            Accounts Payable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Amount Owed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.length > 0 ? payables.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.narration}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={2} className="text-center">No outstanding payables.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivablesPayables;