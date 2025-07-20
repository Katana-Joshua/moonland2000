import React, { useState } from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, Filter } from 'lucide-react';

const DayBook = () => {
  const { transactions } = useAccounting();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesText = tx.narration.toLowerCase().includes(filter.toLowerCase()) ||
                        tx.debit.account.toLowerCase().includes(filter.toLowerCase()) ||
                        tx.credit.account.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesText && matchesType;
  });

  const formatCurrency = (amount) => amount.toLocaleString();

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <Book className="w-6 h-6 mr-2" />
          Day Book (All Transactions)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input 
            placeholder="Filter by narration or account..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/20 border-amber-800/50 text-amber-100"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-black/20 border-amber-800/50 text-amber-100">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Sale">Sale</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
              <SelectItem value="Payment">Payment</SelectItem>
              <SelectItem value="Receipt">Receipt</SelectItem>
              <SelectItem value="Journal">Journal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Debit Account</TableHead>
                <TableHead>Credit Account</TableHead>
                <TableHead className="text-right">Amount (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>{tx.narration}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="text-green-400">{tx.debit.account}</TableCell>
                  <TableCell className="text-red-400">{tx.credit.account}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(tx.debit.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayBook;