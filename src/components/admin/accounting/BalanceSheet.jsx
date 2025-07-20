import React from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, Building, Coins as HandCoins, Landmark, Package, Wallet, Shield } from 'lucide-react';

const BalanceSheet = () => {
  const { balanceSheet } = useAccounting();
  const { assets, liabilities, equity } = balanceSheet;

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-100">
          <Scale className="w-6 h-6 mr-2" />
          Balance Sheet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center"><Building className="w-5 h-5 mr-2"/>Assets</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="flex items-center"><Landmark className="w-4 h-4 mr-2 text-amber-400"/>Cash & Bank</TableCell>
                  <TableCell className="text-right">{formatCurrency(assets.cashAndBank)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="flex items-center"><HandCoins className="w-4 h-4 mr-2 text-amber-400"/>Accounts Receivable</TableCell>
                  <TableCell className="text-right">{formatCurrency(assets.accountsReceivable)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="flex items-center"><Package className="w-4 h-4 mr-2 text-amber-400"/>Inventory</TableCell>
                  <TableCell className="text-right">{formatCurrency(assets.inventory)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-green-900/30 rounded-lg flex justify-between items-center font-bold text-green-300">
              <span>Total Assets</span>
              <span>{formatCurrency(assets.total)}</span>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center"><Wallet className="w-5 h-5 mr-2"/>Liabilities & Equity</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="flex items-center"><HandCoins className="w-4 h-4 mr-2 text-amber-400"/>Accounts Payable</TableCell>
                  <TableCell className="text-right">{formatCurrency(liabilities.accountsPayable)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="flex items-center"><Shield className="w-4 h-4 mr-2 text-amber-400"/>Retained Earnings (Equity)</TableCell>
                  <TableCell className="text-right">{formatCurrency(equity.retainedEarnings)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-red-900/30 rounded-lg flex justify-between items-center font-bold text-red-300">
              <span>Total Liabilities & Equity</span>
              <span>{formatCurrency(liabilities.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-amber-200/60">This is a simplified balance sheet. Assets = Liabilities + Equity.</p>
      </CardFooter>
    </Card>
  );
};

export default BalanceSheet;