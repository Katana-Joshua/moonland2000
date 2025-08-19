import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, DollarSign, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ShiftManager = () => {
  const { startShift, endShift, currentShift, setCurrentShift } = usePOS();
  const { user } = useAuth();
  const [startingCash, setStartingCash] = useState('200.00');
  const [endingCash, setEndingCash] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const saved = localStorage.getItem('moonland_current_shift');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔄 Restoring shift from localStorage:', parsed);
        if (parsed && !parsed.endTime && parsed.status === 'active') {
          setCurrentShift(parsed);
        } else {
          localStorage.removeItem('moonland_current_shift');
        }
      } catch (e) {
        console.error('❌ Error parsing saved shift:', e);
        localStorage.removeItem('moonland_current_shift');
      }
    }
  }, []);

  // Debug current shift data
  useEffect(() => {
    if (currentShift) {
      console.log('📊 Current shift data:', currentShift);
      console.log('🕐 Start time:', currentShift.startTime);
      console.log('🕐 Start time type:', typeof currentShift.startTime);
    }
  }, [currentShift]);

  const handleStartShift = async (e) => {
    e.preventDefault();
    
    if (!startingCash || startingCash <= 0) {
      toast({
        title: "Invalid Starting Cash",
        description: "Please enter a valid starting cash amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await startShift(user.id, user.name || user.username, startingCash);
    } catch (error) {
      console.error('Error starting shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndShift = async (e) => {
    e.preventDefault();
    
    if (!endingCash || endingCash <= 0) {
      toast({
        title: "Invalid Ending Cash",
        description: "Please enter a valid ending cash amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await endShift(endingCash);
    } catch (error) {
      console.error('Error ending shift:', error);
    } finally {
      setIsLoading(false);
    }
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
                      value={user?.name || user?.username || ''}
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Starting Shift...' : 'Start Shift'}
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
                  {(() => {
                    console.log('🕐 Rendering start time:', currentShift.startTime);
                    if (currentShift.startTime) {
                      try {
                        const date = new Date(currentShift.startTime);
                        console.log('🕐 Parsed date:', date);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('en-US', { 
                            timeZone: 'Africa/Kampala',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        } else {
                          console.log('🕐 Invalid date:', currentShift.startTime);
                          return 'Invalid Date';
                        }
                      } catch (error) {
                        console.log('🕐 Date parsing error:', error);
                        return 'Error';
                      }
                    } else {
                      console.log('🕐 No start time available');
                      return 'N/A';
                    }
                  })()}
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
                disabled={isLoading}
              >
                {isLoading ? 'Ending Shift...' : 'End Shift'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ShiftManager;