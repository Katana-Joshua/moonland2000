import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { usePOS } from './POSContext.jsx';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';
import { accountingAPI } from '@/lib/api';
import { useAuth } from './AuthContext.jsx';


const AccountingContext = createContext();

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};

export const AccountingProvider = ({ children }) => {
  const { sales, expenses, inventory } = usePOS();
  const { user, isAuthenticated } = useAuth();
  const [vouchers, setVouchers] = useLocalStorage('moonland_vouchers', []);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      // Only fetch accounts if user is authenticated AND is admin
      if (!isAuthenticated || !user || user.role !== 'admin') {
        setLoadingAccounts(false);
        return;
      }

      setLoadingAccounts(true);
      try {
        const accounts = await accountingAPI.getAccounts();
        setAccounts(accounts);
      } catch (error) {
        // Don't show error toast for authentication errors
        if (!error.message.includes('Access token required') && !error.message.includes('Unauthorized') && !error.message.includes('Insufficient permissions')) {
          toast({ title: 'Error fetching accounts', description: error.message, variant: 'destructive' });
        }
      }
      setLoadingAccounts(false);
    };
    fetchAccounts();
  }, [isAuthenticated, user]);

  const addAccount = async (account) => {
    try {
      const response = await accountingAPI.addAccount(account);
      if (response.success) {
        const newAccount = response.data;
        setAccounts(prev => [...prev, newAccount]);
        toast({ title: 'Account Created', description: `Account "${newAccount.name}" has been successfully created.` });
        return newAccount;
      } else {
        toast({ title: 'Error adding account', description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      toast({ title: 'Error adding account', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const addVoucher = (voucher) => {
    const newVoucher = { ...voucher, id: `V-${Date.now()}` };
    setVouchers(prev => [...prev, newVoucher]);
    toast({ title: "Voucher Created", description: `Voucher ${newVoucher.type} for UGX ${newVoucher.amount} has been recorded.` });
  };

  const transactions = useMemo(() => {
    const allTransactions = [];

    // Sales transactions
    sales.forEach(sale => {
      // For cash sales
      if (sale.paymentMethod !== 'Credit') {
        allTransactions.push({
          id: `S-${sale.id}`,
          date: sale.timestamp,
          type: 'Sale',
          narration: `Sale to Customer (Receipt #${sale.id})`,
          debit: { account: 'Cash/Bank', amount: sale.total },
          credit: { account: 'Sales', amount: sale.total },
        });
      } else {
        // For credit sales
        allTransactions.push({
          id: `S-${sale.id}`,
          date: sale.timestamp,
          type: 'Sale',
          narration: `Credit Sale to ${sale.customerName} (Receipt #${sale.id})`,
          debit: { account: 'Accounts Receivable', amount: sale.total },
          credit: { account: 'Sales', amount: sale.total },
        });
      }

      // Cost of Goods Sold (only if we have profit data)
      if (sale.profit !== undefined && sale.profit !== null) {
        const costOfGoods = sale.total - sale.profit;
        if (costOfGoods > 0) {
          allTransactions.push({
            id: `COGS-${sale.id}`,
            date: sale.timestamp,
            type: 'COGS',
            narration: `Cost of Goods Sold for Sale #${sale.id}`,
            debit: { account: 'Cost of Goods Sold', amount: costOfGoods },
            credit: { account: 'Inventory', amount: costOfGoods },
          });
        }
      }
    });

    // Expenses transactions
    expenses.forEach(expense => {
      allTransactions.push({
        id: `E-${expense.id}`,
        date: expense.timestamp,
        type: 'Expense',
        narration: expense.description,
        debit: { account: 'Operating Expenses', amount: expense.amount },
        credit: { account: 'Cash/Bank', amount: expense.amount },
      });
    });

    // Vouchers transactions
    vouchers.forEach(voucher => {
      allTransactions.push({
        id: voucher.id,
        date: voucher.date,
        type: voucher.type,
        narration: voucher.narration,
        debit: { account: voucher.debitAccount, amount: voucher.amount },
        credit: { account: voucher.creditAccount, amount: voucher.amount },
      });
    });

    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, expenses, vouchers]);

  const ledgers = useMemo(() => {
    const ledgerData = {};
    
    // Initialize all accounts from chart of accounts
    accounts.forEach(acc => {
      if (!ledgerData[acc.name]) {
        ledgerData[acc.name] = { transactions: [], balance: 0 };
      }
    });

    transactions.forEach(tx => {
      const { debit, credit } = tx;
      
      // Debit entry
      if (!ledgerData[debit.account]) ledgerData[debit.account] = { transactions: [], balance: 0 };
      ledgerData[debit.account].transactions.push({ ...tx, type: 'debit', amount: debit.amount });
      
      // Credit entry
      if (!ledgerData[credit.account]) ledgerData[credit.account] = { transactions: [], balance: 0 };
      ledgerData[credit.account].transactions.push({ ...tx, type: 'credit', amount: credit.amount });
    });

    // Calculate balances using proper accounting rules
    for (const account in ledgerData) {
      let balance = 0;
      // Sort transactions by date for correct balance calculation
      ledgerData[account].transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      ledgerData[account].transactions.forEach(transaction => {
        const accountInfo = accounts.find(a => a.name === account);
        const accountType = accountInfo ? accountInfo.type : '';
        
        // Determine if this account has a normal debit or credit balance
        const isDebitNormal = ['asset', 'expense'].includes(accountType);
        
        if (transaction.debit.account === account) {
          // This account is being debited
          if (isDebitNormal) {
            balance += transaction.debit.amount; // Increase for assets/expenses
          } else {
            balance -= transaction.debit.amount; // Decrease for liabilities/equity/revenue
          }
        } else if (transaction.credit.account === account) {
          // This account is being credited
          if (isDebitNormal) {
            balance -= transaction.credit.amount; // Decrease for assets/expenses
          } else {
            balance += transaction.credit.amount; // Increase for liabilities/equity/revenue
          }
        }
        
        transaction.balance = balance;
      });
      ledgerData[account].balance = balance;
    }
    return ledgerData;
  }, [transactions, accounts]);

  const trialBalance = useMemo(() => {
    const trialAccounts = {};
    Object.entries(ledgers).forEach(([accountName, data]) => {
        const accountInfo = accounts.find(a => a.name === accountName);
        const accountType = accountInfo ? accountInfo.type : '';
        const isDebitNormal = ['asset', 'expense'].includes(accountType);

        // For trial balance, we show the normal balance side
        if (data.balance > 0) {
            if (isDebitNormal) {
                // Assets and Expenses normally have debit balances
                trialAccounts[accountName] = { debit: data.balance, credit: 0 };
            } else {
                // Liabilities, Equity, and Revenue normally have credit balances
                trialAccounts[accountName] = { debit: 0, credit: data.balance };
            }
        } else if (data.balance < 0) {
            if (isDebitNormal) {
                // Assets and Expenses with negative balance (abnormal) go to credit side
                trialAccounts[accountName] = { debit: 0, credit: -data.balance };
            } else {
                // Liabilities, Equity, and Revenue with negative balance (abnormal) go to debit side
                trialAccounts[accountName] = { debit: -data.balance, credit: 0 };
            }
        } else {
            // Zero balance accounts don't appear in trial balance
            // trialAccounts[accountName] = { debit: 0, credit: 0 };
        }
    });
    return trialAccounts;
  }, [ledgers, accounts]);

  const profitAndLoss = useMemo(() => {
    const revenue = ledgers['Sales']?.balance || 0;
    const cogs = ledgers['Cost of Goods Sold']?.balance || 0;
    const grossProfit = revenue - cogs;
    const operatingExpenses = ledgers['Operating Expenses']?.balance || 0;
    const netProfit = grossProfit - operatingExpenses;
    return { revenue, cogs, grossProfit, operatingExpenses, netProfit };
  }, [ledgers]);

  const balanceSheet = useMemo(() => {
    const assets = {
        cashAndBank: ledgers['Cash/Bank']?.balance || 0,
        accountsReceivable: ledgers['Accounts Receivable']?.balance || 0,
        inventory: ledgers['Inventory']?.balance || 0,
    };
    assets.total = Object.values(assets).reduce((sum, val) => sum + val, 0);

    const liabilities = {
        accountsPayable: ledgers['Accounts Payable']?.balance || 0,
    };
    const equity = {
        retainedEarnings: profitAndLoss.netProfit, // Simplified
    };
    liabilities.total = (liabilities.accountsPayable || 0) + equity.retainedEarnings;

    return { assets, liabilities, equity };
  }, [ledgers, profitAndLoss]);

  const stockValuation = useMemo(() => {
    return inventory.map(item => ({
      ...item,
      value: item.stock * item.costPrice
    }));
  }, [inventory]);

  const value = {
    transactions,
    ledgers,
    trialBalance,
    profitAndLoss,
    balanceSheet,
    stockValuation,
    vouchers,
    addVoucher,
    accounts,
    addAccount,
    loadingAccounts,
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
};