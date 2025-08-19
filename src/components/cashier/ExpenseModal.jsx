import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/contexts/POSContext';
import { toast } from '@/components/ui/use-toast';
import { TrendingDown, Calendar, Clock } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose }) => {
  const { addExpense } = usePOS();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in both description and amount.',
        variant: 'destructive',
      });
      return;
    }

    addExpense({
      description,
      amount: parseFloat(amount),
    });

    setDescription('');
    setAmount('');

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-red-800/50">
        <DialogHeader>
          <DialogTitle className="text-red-100 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            Record an Expense
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="description" className="text-amber-200">
              Expense Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="e.g., Cleaning Supplies, Repair"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-amber-200">
              Amount (UGX)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="e.g., 50000"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Record Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;