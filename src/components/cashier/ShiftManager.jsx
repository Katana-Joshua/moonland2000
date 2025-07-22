import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, DollarSign, User } from 'lucide-react';

const ShiftManager = () => {
  const { startShift, endShift, currentShift } = usePOS();
  const { user } = useAuth();
  const [startingCash, setStartingCash] = useState('200.00');
  const [endingCash, setEndingCash] = useState('');

  // Persist currentShift in localStorage
  useEffect(() => {
    if (currentShift) {
      localStorage.setItem('moonland_current_shift', JSON.stringify(currentShift));
    } else {
      localStorage.removeItem('moonland_current_shift');
    }
  }, [currentShift]);

  // On mount, restore shift if present
  useEffect(() => {
    if (!currentShift) {
      const saved = localStorage.getItem('moonland_current_shift');
      if (saved) {
        // You may want to validate the saved data
        // setCurrentShift(JSON.parse(saved));
      }
    }
  }, []);

  const handleStartShift = (e) => {
    e.preventDefault();
    if (!user || !startingCash) return;
    startShift(user.id, user.username, startingCash);
  };

  const handleEndShift = (e) => {
    e.preventDefault();
    if (!endingCash) return;
    endShift(endingCash);
  };

  if (!currentShift) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-amber-800/50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-amber-100">
                <Clock className="w-6 h-6 mr-2" />
                Start Your Shift
              </CardTitle>
              <p className="text-amber-200/80">Begin your cashier session</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartShift} className="space-y-4">
                <div>
                  <Label className="text-amber-200">Cashier Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                    <Input
                      value={user?.username || ''}
                      className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-amber-200">Starting Cash Amount</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-3 h-4 w-8 text-amber-400 font-bold">UGX</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      className="pl-14 bg-black/20 border-amber-800/50 text-amber-100"
                      placeholder="e.g. 20000"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Start Shift
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-amber-800/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-amber-100">
              <Clock className="w-6 h-6 mr-2" />
              End Your Shift
            </CardTitle>
            <p className="text-amber-200/80">Complete your cashier session</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-black/20 rounded-lg border border-amber-800/30">
                <p className="text-sm text-amber-200/80">Cashier</p>
                <p className="font-semibold text-amber-100">{currentShift.cashierName}</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg border border-amber-800/30">
                <p className="text-sm text-amber-200/80">Shift Started</p>
                <p className="font-semibold text-amber-100">
                  {currentShift.startTime && !isNaN(new Date(currentShift.startTime))
                    ? new Date(currentShift.startTime).toLocaleString('en-US', { timeZone: 'Africa/Kampala' })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg border border-amber-800/30">
                <p className="text-sm text-amber-200/80">Starting Cash</p>
                <p className="font-semibold text-amber-100">UGX {currentShift.startingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <form onSubmit={handleEndShift} className="space-y-4">
              <div>
                <Label className="text-amber-200">Ending Cash Amount</Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 top-3 h-4 w-8 text-amber-400 font-bold">UGX</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={endingCash}
                    onChange={(e) => setEndingCash(e.target.value)}
                    className="pl-14 bg-black/20 border-amber-800/50 text-amber-100"
                    placeholder="Enter ending cash amount"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                End Shift
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ShiftManager;