import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Edit2, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const CartItemPrice = ({ item }) => {
  const { updateCartItemPrice } = usePOS();
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(item.price);

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice)) {
      toast({ title: "Invalid price format", variant: "destructive" });
      setPrice(item.price); // Reset to original cart price
      return;
    }
    updateCartItemPrice(item.id, newPrice);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePriceUpdate();
    } else if (e.key === 'Escape') {
      setPrice(item.price);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={handlePriceUpdate}
        onKeyDown={handleKeyDown}
        className="h-7 w-28 text-xs text-right bg-black/30 border-amber-600"
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-xs text-amber-200/80 hover:text-amber-100 hover:underline flex items-center gap-1"
    >
      UGX {item.price.toLocaleString()} each
      <Edit2 className="w-3 h-3 opacity-70" />
    </button>
  );
};


const Cart = ({ onCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, setBackdateTimestamp } = usePOS();
  const [showBackdate, setShowBackdate] = useState(false);
  const [backdateDate, setBackdateDate] = useState('');
  const [backdateTime, setBackdateTime] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBackdateChange = () => {
    if (backdateDate && backdateTime) {
      const backdateString = `${backdateDate}T${backdateTime}`;
      setBackdateTimestamp(backdateString);
      toast({
        title: "Backdate Set",
        description: `Sale will be recorded for ${new Date(backdateString).toLocaleString()}`,
      });
    } else {
      setBackdateTimestamp(null);
      toast({
        title: "Backdate Cleared",
        description: "Sale will be recorded with current date/time",
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
      description: "Sale will be recorded with current date/time",
    });
  };

  return (
    <Card className="glass-effect border-amber-800/50 lg:sticky lg:top-4 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-amber-100 text-lg">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Current Order ({cart.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Backdate Section */}
        <div className="p-3 bg-black/20 rounded-lg border border-amber-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-100">Transaction Date/Time</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBackdate(!showBackdate)}
              className="text-amber-400 hover:text-amber-300"
            >
              {showBackdate ? 'Hide' : 'Set Backdate'}
            </Button>
          </div>
          
          {showBackdate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-amber-200/80 block mb-1">Date</label>
                  <Input
                    type="date"
                    value={backdateDate}
                    onChange={(e) => setBackdateDate(e.target.value)}
                    className="h-8 text-xs bg-black/30 border-amber-600 text-amber-100"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-amber-200/80 block mb-1">Time</label>
                  <Input
                    type="time"
                    value={backdateTime}
                    onChange={(e) => setBackdateTime(e.target.value)}
                    className="h-8 text-xs bg-black/30 border-amber-600 text-amber-100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleBackdateChange}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  disabled={!backdateDate || !backdateTime}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Apply Backdate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearBackdate}
                  className="border-amber-800/50 text-amber-100 hover:bg-red-950/50 text-xs"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="max-h-64 lg:max-h-80 overflow-y-auto space-y-2 pr-2">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-2 bg-black/20 rounded-lg border border-amber-800/30"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-100 text-sm">{item.name}</h4>
                    <CartItemPrice item={item} />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="h-6 w-6 p-0 hover:bg-red-950/50"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 p-0 border-amber-800/50"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-amber-100 font-semibold min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0 border-amber-800/50"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-amber-100">
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingCart className="w-10 h-10 mx-auto text-amber-400/50 mb-2" />
            <p className="text-amber-200/60 text-sm">Cart is empty</p>
          </div>
        ) : (
          <>
            <div className="border-t border-amber-800/30 pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-semibold text-amber-100">Total:</span>
                <span className="text-xl font-bold text-amber-100">UGX {total.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={onCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full border-amber-800/50 text-amber-100 hover:bg-red-950/50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;