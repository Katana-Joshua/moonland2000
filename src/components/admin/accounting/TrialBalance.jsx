import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FileText, CheckCircle } from 'lucide-react';

const TrialBalance = () => {
  const { trialBalance } = useAccounting();

  const totalDebit = Object.values(trialBalance).reduce((sum, acc) => sum + (acc.debit || 0), 0);
  const totalCredit = Object.values(trialBalance).reduce((sum, acc) => sum + (acc.credit || 0), 0);
  const isBalanced = Math.round(totalDebit) === Math.round(totalCredit);

  const formatCurrency = (amount) => amount > 0 ? amount.toLocaleString() : '-';

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <FileText className="w-6 h-6 mr-2" />
          Trial Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Debit (UGX)</TableHead>
                <TableHead className="text-right">Credit (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(trialBalance).sort().map(([account, balances]) => (
                <TableRow key={account}>
                  <TableCell>{account}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(balances.debit)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(balances.credit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-black/30">
              <TableRow>
                <TableHead>Total</TableHead>
                <TableHead className="text-right font-bold text-amber-100">{totalDebit.toLocaleString()}</TableHead>
                <TableHead className="text-right font-bold text-amber-100">{totalCredit.toLocaleString()}</TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-2 font-semibold ${isBalanced ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          <CheckCircle className="w-5 h-5" />
          <span>{isBalanced ? 'Trial Balance is matched.' : 'Trial Balance does not match!'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialBalance;