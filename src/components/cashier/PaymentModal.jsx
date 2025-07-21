
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Banknote, Smartphone, Mail, Printer, BookUser, User } from 'lucide-react';
import Receipt from '@/components/common/Receipt';
import { formatCurrency } from '@/lib/utils';

const PaymentModal = ({ isOpen, onClose, onReprint }) => {
  const { cart, processSale } = usePOS();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState({ name: '', contact: '' });
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [lastCart, setLastCart] = useState([]);

  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  useEffect(() => {
    // Reset cash received when payment method changes or modal reopens
    if (isOpen) {
        setCashReceived('');
    }
  }, [isOpen, paymentMethod]);


  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'mobile', label: 'Mobile Money', icon: Smartphone },
    { id: 'credit', label: 'Credit', icon: BookUser },
  ];

  const handlePayment = async () => {
    if (cart.length === 0) return;

    // Debug: Log cart contents at payment
    console.log('🛒 Cart contents at payment:', cart);

    // Validation: Prevent zero or missing price
    const zeroPriceItem = cart.find(item => !item.price || Number(item.price) === 0);
    if (zeroPriceItem) {
      toast({
        title: "Invalid Item Price",
        description: `Item "${zeroPriceItem.name}" has a price of 0. Please set a valid price before completing the sale.`,
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'credit' && !customerInfo.name) {
      toast({
        title: "Customer Name Required",
        description: "Please enter a customer name for credit sales.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'cash' && (cashReceived === '' || parseFloat(cashReceived) < total)) {
      toast({
        title: "Insufficient Cash",
        description: "Cash received must be equal to or greater than the total amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentCart = [...cart];
    const saleTimestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Africa/Kampala' });
    const saleData = { 
        paymentMethod, 
        customerInfo, 
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        changeGiven: paymentMethod === 'cash' ? change : null,
        timestamp: saleTimestamp, // Add Kampala time
    };
    const sale = await processSale(saleData);
    
    if (sale) {
      // Use the API response as-is for the receipt
      setLastSale({
        ...sale,
        customerInfo: customerInfo // only override if needed
      });
      setLastCart(currentCart);
      // Ensure receipt prints after state updates
      setTimeout(() => {
        try {
          handlePrint();
          toast({
            title: "Receipt Printed",
            description: `Receipt #${sale.receiptNumber} has been printed successfully.`
          });
        } catch (error) {
          console.error('Print error:', error);
          toast({
            title: "Print Error",
            description: "Receipt saved but printing failed. You can reprint from the menu.",
            variant: "destructive"
          });
        }
      }, 1000);
      setCustomerInfo({ name: '', contact: '' });
      setPaymentMethod('cash');
      setCashReceived('');
      onClose();
    }
    
    setIsProcessing(false);
  };

  const handleEmailReceipt = () => {
    toast({
      title: "Email Receipt",
      description: `🚧 Emailing receipts isn't implemented yet—but you can request it! 🚀`
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-effect border-amber-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-black/20 rounded-lg border border-amber-800/30">
              <h3 className="font-semibold text-amber-100 mb-3">Order Summary</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-amber-200/80">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-amber-100">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-amber-800/30 mt-3 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-amber-100">Total:</span>
                  <span className="text-amber-100">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-amber-200 mb-3 block">Payment Method</Label>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center p-2 h-auto ${
                        paymentMethod === method.id 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'border-amber-800/50 hover:bg-amber-950/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs text-center">{method.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'cash' && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-3 bg-amber-950/30 rounded-lg"
                >
                    <div>
                        <Label htmlFor="cashReceived" className="text-amber-200">Cash Received (UGX)</Label>
                        <Input
                            id="cashReceived"
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="bg-black/20 border-amber-800/50 text-amber-100 text-lg"
                            placeholder="e.g. 50000"
                        />
                    </div>
                    {cashReceived && change >= 0 && (
                        <div className="text-right">
                            <p className="text-amber-200/80 text-sm">Change to give back:</p>
                            <p className="text-xl font-bold text-green-400">{formatCurrency(change)}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {paymentMethod === 'credit' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 p-3 bg-amber-950/30 rounded-lg"
              >
                <Label className="text-amber-200">Customer Details (for Credit)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
                    placeholder="Customer Name"
                  />
                </div>
                 <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                  <Input
                    value={customerInfo.contact}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
                    className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
                    placeholder="Contact (Phone/Email)"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg h-12"
              >
                {isProcessing ? 'Processing...' : `Complete Sale - ${formatCurrency(total)}`}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={onReprint}
                  variant="outline"
                  className="border-amber-800/50 text-amber-100"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Reprint Last
                </Button>
                <Button
                  onClick={handleEmailReceipt}
                  variant="outline"
                  className="border-amber-800/50 text-amber-100"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Receipt
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="hidden">
        <Receipt ref={receiptRef} sale={lastSale} cart={lastCart} />
      </div>
    </>
  );
};

export default PaymentModal;
