import React, { useState, useEffect } from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2 } from 'lucide-react';

const LedgerManagement = () => {
  const { ledgers, accounts, loadingAccounts } = useAccounting();
  const [selectedLedger, setSelectedLedger] = useState('');

  useEffect(() => {
    if (accounts.length > 0 && !selectedLedger) {
      setSelectedLedger(accounts[0].name);
    }
  }, [accounts, selectedLedger]);

  const ledgerData = ledgers[selectedLedger];
  const formatCurrency = (amount) => amount ? amount.toLocaleString() : '0';

  if (loadingAccounts) {
    return (
      <Card className="glass-effect border-amber-800/50 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 mr-2 animate-spin text-amber-400" />
        <span className="text-amber-100">Loading Ledgers...</span>
      </Card>
    );
  }
  
  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <BookOpen className="w-6 h-6 mr-2" />
          Ledger Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select value={selectedLedger} onValueChange={setSelectedLedger}>
            <SelectTrigger className="w-full md:w-[300px] bg-black/20 border-amber-800/50 text-amber-100">
              <SelectValue placeholder="Select a ledger" />
            </SelectTrigger>
            <SelectContent>
              {accounts.sort((a,b) => a.name.localeCompare(b.name)).map(account => (
                <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {ledgerData ? (
          <div>
            <div className="flex justify-between items-center mb-4 p-4 glass-effect rounded-lg">
              <h3 className="text-xl font-bold text-amber-300">{selectedLedger}</h3>
              <div className="text-right">
                <p className="text-sm text-amber-200/80">Closing Balance</p>
                <p className={`text-lg font-bold ${ledgerData.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  UGX {formatCurrency(Math.abs(ledgerData.balance))} {ledgerData.balance >= 0 ? 'Dr' : 'Cr'}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.transactions.length > 0 ? ledgerData.transactions.map((tx, index) => (
                    <TableRow key={`${tx.id}-${index}`}>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell>{tx.narration}</TableCell>
                      <TableCell className="text-right text-green-400 font-mono">
                        {tx.debit.account === selectedLedger ? formatCurrency(tx.debit.amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-mono">
                        {tx.credit.account === selectedLedger ? formatCurrency(tx.credit.amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan="5" className="text-center text-amber-200/70">No transactions for this ledger yet.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : <p className="text-amber-200/80">Select a ledger to view details.</p>}
      </CardContent>
    </Card>
  );
};

export default LedgerManagement;