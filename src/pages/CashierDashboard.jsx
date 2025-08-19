import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { LogOut, ShoppingCart, Clock, Printer, TrendingDown, PowerOff, X } from 'lucide-react';
import MenuGrid from '@/components/cashier/MenuGrid';
import Cart from '@/components/cashier/Cart';
import ShiftManager from '@/components/cashier/ShiftManager';
import PaymentModal from '@/components/cashier/PaymentModal';
import ExpenseModal from '@/components/cashier/ExpenseModal';
import ReprintReceiptModal from '@/components/cashier/ReprintReceiptModal';
import Loading from '@/components/ui/loading';

const CashierDashboard = () => {
  const { user, logout } = useAuth();
  const { currentShift, cart, sales, isLoading, checkShiftValidity, endShift } = usePOS();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);
  const [isEndShiftModalOpen, setIsEndShiftModalOpen] = useState(false);
  const [endingCash, setEndingCash] = useState('');
  const [isEndingShift, setIsEndingShift] = useState(false);

  // Check shift validity on component mount and when currentShift changes
  useEffect(() => {
    if (currentShift) {
      checkShiftValidity();
    }
  }, [currentShift, checkShiftValidity]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEndShift = async (e) => {
    e.preventDefault();
    
    if (!endingCash || endingCash <= 0) {
      alert('Please enter a valid ending cash amount');
      return;
    }

    setIsEndingShift(true);
    try {
      await endShift(endingCash);
      setIsEndShiftModalOpen(false);
      setEndingCash('');
    } catch (error) {
      console.error('Error ending shift:', error);
    } finally {
      setIsEndingShift(false);
    }
  };

  if (user?.role !== 'cashier') {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <Loading message="Loading POS data..." />;
  }

  if (!currentShift) {
    return <ShiftManager />;
  }

  const shiftSales = sales.filter(sale => 
    new Date(sale.timestamp) >= new Date(currentShift.startTime)
  );
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-100">Moon Land Terminal</h1>
            <p className="text-amber-200/80">Welcome, {user.name || user.username}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setIsEndShiftModalOpen(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <PowerOff className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">End Shift</span>
            </Button>
            <Button
              onClick={() => setIsReprintModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50"
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Reprint</span>
            </Button>
            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-red-800/50 text-red-100 hover:bg-red-950/50"
            >
              <TrendingDown className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Expense</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-6"
        >
          <div className="glass-effect p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-amber-500 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-amber-200/80">Shift Started</p>
                <p className="font-semibold text-amber-100 text-sm sm:text-base">
                  {currentShift.startTime && !isNaN(new Date(currentShift.startTime))
                    ? new Date(currentShift.startTime).toLocaleTimeString('en-US', { timeZone: 'Africa/Kampala' })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <Printer className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-amber-200/80">Orders</p>
                <p className="font-semibold text-amber-100 text-sm sm:text-base">{shiftSales.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect p-3 sm:p-4 rounded-lg col-span-2 md:col-span-1">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-amber-500 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-amber-200/80">Current Cart</p>
                <p className="font-semibold text-amber-100 text-sm sm:text-base">UGX {cartTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Cart (top on mobile) */}
          <div className="lg:hidden">
            <Cart onCheckout={() => setIsPaymentModalOpen(true)} />
          </div>

          {/* Menu Grid */}
          <div className="lg:flex-1 lg:min-w-0">
            <MenuGrid />
          </div>

          {/* Cart (side on desktop) */}
          <div className="hidden lg:block lg:w-96 lg:flex-shrink-0">
            <Cart onCheckout={() => setIsPaymentModalOpen(true)} />
          </div>
        </div>

        {/* End Shift Modal */}
        {isEndShiftModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <Card className="glass-effect border-amber-800/50">
                <CardHeader className="text-center">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center justify-center text-amber-100">
                      <Clock className="w-6 h-6 mr-2" />
                      End Your Shift
                    </CardTitle>
                    <Button
                      onClick={() => setIsEndShiftModalOpen(false)}
                      variant="ghost"
                      size="sm"
                      className="text-amber-200 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
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
                          ? new Date(currentShift.startTime).toLocaleString('en-US', { 
                              timeZone: 'Africa/Kampala',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
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
                      disabled={isEndingShift}
                    >
                      {isEndingShift ? 'Ending Shift...' : 'End Shift'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onReprint={() => {
            setIsPaymentModalOpen(false);
            setIsReprintModalOpen(true);
          }}
        />

        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
        
        {/* Reprint Receipt Modal */}
        <ReprintReceiptModal
          isOpen={isReprintModalOpen}
          onClose={() => setIsReprintModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default CashierDashboard;