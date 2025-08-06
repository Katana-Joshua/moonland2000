import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePOS } from '@/contexts/POSContext';
import { TrendingDown, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ExpenseTracking = () => {
  const { expenses, deleteExpense } = usePOS();
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleDeleteExpense = async (expenseId, expenseDescription) => {
    if (!confirm(`Are you sure you want to delete the expense "${expenseDescription}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingExpenseId(expenseId);
    
    try {
      const success = await deleteExpense(expenseId);
      if (success) {
        toast({
          title: "Expense Deleted",
          description: "The expense has been removed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingExpenseId(null);
    }
  };

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
                  className="p-4 bg-black/20 rounded-lg border border-red-800/30 hover:border-red-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-red-100">{expense.description}</p>
                      <p className="text-sm text-red-200/80">
                        {new Date(expense.timestamp).toLocaleString()} by {expense.cashier}
                      </p>
                      {expense.category && (
                        <p className="text-xs text-red-300/60 mt-1">
                          Category: {expense.category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-red-200">- UGX {expense.amount.toLocaleString()}</p>
                      <Button
                        onClick={() => handleDeleteExpense(expense.id, expense.description)}
                        disabled={deletingExpenseId === expense.id}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 h-8 w-8"
                        title="Delete expense"
                      >
                        {deletingExpenseId === expense.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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