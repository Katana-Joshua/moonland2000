import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/contexts/POSContext';
import { toast } from '@/components/ui/use-toast';
import { TrendingDown, Calendar, Clock } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose }) => {
  const { addExpense, backdateTimestamp, setBackdateTimestamp } = usePOS();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showBackdate, setShowBackdate] = useState(false);
  const [backdateDate, setBackdateDate] = useState('');
  const [backdateTime, setBackdateTime] = useState('');

  const handleBackdateChange = () => {
    if (backdateDate && backdateTime) {
      const backdateString = `${backdateDate}T${backdateTime}`;
      setBackdateTimestamp(backdateString);
      toast({
        title: "Backdate Set",
        description: `Expense will be recorded for ${new Date(backdateString).toLocaleString()}`,
      });
    } else {
      setBackdateTimestamp(null);
      toast({
        title: "Backdate Cleared",
        description: "Expense will be recorded for current time",
      });
    }
  };

  const clearBackdate = () => {
    setBackdateDate('');
    setBackdateTime('');
    setBackdateTimestamp(null);
    setShowBackdate(false);
    toast({
      title: "Backdate Cleared",
      description: "Expense will be recorded for current time",
    });
  };

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
    // Clear backdate after expense is added
    if (backdateTimestamp) {
      clearBackdate();
    }
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

          {/* Backdate Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-amber-200 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Backdate Expense
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBackdate(!showBackdate)}
                className="text-amber-400 border-amber-700 hover:bg-amber-900/20"
              >
                {showBackdate ? 'Hide' : 'Set Backdate'}
              </Button>
            </div>

            {showBackdate && (
              <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-amber-800/30">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="backdate-date" className="text-amber-200 text-sm">
                      Date
                    </Label>
                    <Input
                      id="backdate-date"
                      type="date"
                      value={backdateDate}
                      onChange={(e) => setBackdateDate(e.target.value)}
                      className="bg-black/20 border-amber-800/50 text-amber-100 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backdate-time" className="text-amber-200 text-sm">
                      Time
                    </Label>
                    <Input
                      id="backdate-time"
                      type="time"
                      value={backdateTime}
                      onChange={(e) => setBackdateTime(e.target.value)}
                      className="bg-black/20 border-amber-800/50 text-amber-100 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleBackdateChange}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={!backdateDate || !backdateTime}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Apply Backdate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearBackdate}
                    className="text-red-400 border-red-700 hover:bg-red-900/20"
                  >
                    Clear
                  </Button>
                </div>
                {backdateTimestamp && (
                  <p className="text-xs text-amber-300/80">
                    Expense will be recorded for: {new Date(backdateTimestamp).toLocaleString()}
                  </p>
                )}
              </div>
            )}
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