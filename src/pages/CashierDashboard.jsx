import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { LogOut, ShoppingCart, Clock, Printer, TrendingDown } from 'lucide-react';
import MenuGrid from '@/components/cashier/MenuGrid';
import Cart from '@/components/cashier/Cart';
import ShiftManager from '@/components/cashier/ShiftManager';
import PaymentModal from '@/components/cashier/PaymentModal';
import ExpenseModal from '@/components/cashier/ExpenseModal';
import ReprintReceiptModal from '@/components/cashier/ReprintReceiptModal';
import Loading from '@/components/ui/loading';

const CashierDashboard = () => {
  const { user, logout } = useAuth();
  const { currentShift, cart, sales, isLoading } = usePOS();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <p className="text-amber-200/80">Welcome, {user.username}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
                  {new Date(currentShift.startTime).toLocaleTimeString()}
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart (top on mobile) */}
          <div className="lg:hidden">
            <Cart onCheckout={() => setIsPaymentModalOpen(true)} />
          </div>

          {/* Menu Grid */}
          <div className="lg:flex-grow">
            <MenuGrid />
          </div>

          {/* Cart (side on desktop) */}
          <div className="hidden lg:block lg:w-1/3 lg:flex-shrink-0">
            <Cart onCheckout={() => setIsPaymentModalOpen(true)} />
          </div>
        </div>

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