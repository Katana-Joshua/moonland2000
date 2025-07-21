import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, Wallet } from 'lucide-react';

const BankAndCashBook = () => {
  const { ledgers } = useAccounting();
  const cashBankLedger = ledgers['Cash/Bank'];

  const formatCurrency = (amount) => amount.toLocaleString();

  if (!cashBankLedger) {
    return (
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Landmark className="w-6 h-6 mr-2" />
            Bank & Cash Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-200/80">No cash or bank transactions have been recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <Landmark className="w-6 h-6 mr-2" />
          Bank & Cash Book
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6 p-4 glass-effect rounded-lg">
          <h3 className="text-xl font-bold text-amber-300">Cash & Bank Summary</h3>
          <div className="text-right">
            <p className="text-sm text-amber-200/80">Current Balance</p>
            <p className={`text-lg font-bold ${cashBankLedger.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              UGX {formatCurrency(Math.abs(cashBankLedger.balance))}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead className="text-right">Inflow (Debit)</TableHead>
                <TableHead className="text-right">Outflow (Credit)</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashBankLedger.transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>{tx.narration}</TableCell>
                  <TableCell className="text-right text-green-400 font-mono">
                    {tx.type === 'debit' ? formatCurrency(tx.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-red-400 font-mono">
                    {tx.type === 'credit' ? formatCurrency(tx.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankAndCashBook;