import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Book, BarChart2, FileText, Scale, Coins as HandCoins, Receipt, Banknote, Landmark, ClipboardList, Library } from 'lucide-react';
import LedgerManagement from './LedgerManagement';
import DayBook from './DayBook';
import TrialBalance from './TrialBalance';
import ProfitAndLoss from './ProfitAndLoss';
import BalanceSheet from './BalanceSheet';
import StockValuation from './StockValuation';
import ReceivablesPayables from './ReceivablesPayables';
import VoucherEntry from './VoucherEntry';
import DailyClosingReport from './DailyClosingReport';
import BankAndCashBook from './BankAndCashBook';
import ChartOfAccounts from './ChartOfAccounts';

const AccountingDashboard = () => {
  return (
    <Tabs defaultValue="pl" className="w-full space-y-6">
      <div className="overflow-x-auto pb-2">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 min-w-[1200px] bg-black/20 border border-amber-800/30">
          <TabsTrigger value="pl" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><BarChart2 className="w-4 h-4 mr-1 md:mr-2" /> P&L</TabsTrigger>
          <TabsTrigger value="balance_sheet" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Scale className="w-4 h-4 mr-1 md:mr-2" /> Balance Sheet</TabsTrigger>
          <TabsTrigger value="day_book" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Book className="w-4 h-4 mr-1 md:mr-2" /> Day Book</TabsTrigger>
          <TabsTrigger value="ledgers" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><BookOpen className="w-4 h-4 mr-1 md:mr-2" /> Ledgers</TabsTrigger>
          <TabsTrigger value="chart_of_accounts" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Library className="w-4 h-4 mr-1 md:mr-2" /> Accounts</TabsTrigger>
          <TabsTrigger value="trial_balance" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><FileText className="w-4 h-4 mr-1 md:mr-2" /> Trial Balance</TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><ClipboardList className="w-4 h-4 mr-1 md:mr-2" /> Stock</TabsTrigger>
          <TabsTrigger value="receivables_payables" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><HandCoins className="w-4 h-4 mr-1 md:mr-2" /> Dues</TabsTrigger>
          <TabsTrigger value="vouchers" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Receipt className="w-4 h-4 mr-1 md:mr-2" /> Vouchers</TabsTrigger>
          <TabsTrigger value="cash_bank" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Landmark className="w-4 h-4 mr-1 md:mr-2" /> Cash/Bank</TabsTrigger>
          <TabsTrigger value="closing_report" className="data-[state=active]:bg-amber-600 text-xs md:text-sm"><Banknote className="w-4 h-4 mr-1 md:mr-2" /> Closing</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="pl"><ProfitAndLoss /></TabsContent>
      <TabsContent value="balance_sheet"><BalanceSheet /></TabsContent>
      <TabsContent value="day_book"><DayBook /></TabsContent>
      <TabsContent value="ledgers"><LedgerManagement /></TabsContent>
      <TabsContent value="chart_of_accounts"><ChartOfAccounts /></TabsContent>
      <TabsContent value="trial_balance"><TrialBalance /></TabsContent>
      <TabsContent value="stock"><StockValuation /></TabsContent>
      <TabsContent value="receivables_payables"><ReceivablesPayables /></TabsContent>
      <TabsContent value="vouchers"><VoucherEntry /></TabsContent>
      <TabsContent value="cash_bank"><BankAndCashBook /></TabsContent>
      <TabsContent value="closing_report"><DailyClosingReport /></TabsContent>
    </Tabs>
  );
};

export default AccountingDashboard;