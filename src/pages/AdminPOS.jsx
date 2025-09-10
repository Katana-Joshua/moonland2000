import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ArrowLeft, ShoppingCart, Printer, TrendingDown, RotateCcw } from 'lucide-react';
import MenuGrid from '@/components/cashier/MenuGrid';
import Cart from '@/components/cashier/Cart';
import PaymentModal from '@/components/cashier/PaymentModal';
import ExpenseModal from '@/components/cashier/ExpenseModal';
import ReprintReceiptModal from '@/components/cashier/ReprintReceiptModal';
import SalesReturnModal from '@/components/cashier/SalesReturnModal';

const AdminPOS = () => {
  const { user } = useAuth();
  const { cart } = usePOS();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }
  
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
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-100">Admin POS Terminal</h1>
            <p className="text-amber-200/80">Logged in as: {user.name || user.username}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
             <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50"
             >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Admin</span>
             </Button>
             <Button
              onClick={() => setIsReturnModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50"
            >
              <RotateCcw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Return</span>
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
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-1 gap-2 sm:gap-4 mb-6"
        >
          <div className="glass-effect p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-amber-500 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-amber-200/80">Current Cart</p>
                <p className="font-semibold text-amber-100 text-sm sm:text-base">{formatCurrency(cartTotal)}</p>
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
          cashierName={user.name || user.username}
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

        {/* Sales Return Modal */}
        <SalesReturnModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminPOS;
