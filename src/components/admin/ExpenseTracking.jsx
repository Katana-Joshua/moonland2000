import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { TrendingDown } from 'lucide-react';

const ExpenseTracking = () => {
  const { expenses } = usePOS();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-red-800/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold text-red-100">Expense Tracking</CardTitle>
          <TrendingDown className="h-6 w-6 text-red-400" />
        </CardHeader>
        <CardContent>
            <p className="text-sm text-red-200/80">Total Expenses Incurred</p>
            <p className="text-3xl font-bold text-red-400">UGX {totalExpenses.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100">
            Expense Log ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-amber-200/60 text-center py-8">No expenses recorded yet.</p>
            ) : (
              [...expenses].reverse().map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-red-800/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-100">{expense.description}</p>
                      <p className="text-sm text-red-200/80">
                        {new Date(expense.timestamp).toLocaleString()} by {expense.cashier}
                      </p>
                    </div>
                    <p className="font-bold text-red-200">- UGX {expense.amount.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracking;