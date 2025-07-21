import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOS } from '@/contexts/POSContext';
import { toast } from '@/components/ui/use-toast';
import { Search, Printer, X } from 'lucide-react';
import Receipt from '@/components/common/Receipt';
import { posAPI } from '@/lib/api';


const ReprintReceiptModal = ({ isOpen, onClose }) => {
  const { sales } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundSale, setFoundSale] = useState(null);
  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => toast({ title: 'Receipt Printed', description: `Reprinted receipt #${foundSale.receiptNumber}`})
  });

  const handleSearch = async () => {
    if (!searchQuery) return;
    // Fetch the sale from the API by receipt number
    try {
      const sales = await posAPI.getSales({ receiptNumber: searchQuery });
      const sale = Array.isArray(sales) ? sales[0] : sales;
      if (sale) {
        setFoundSale(sale);
        toast({ title: 'Sale Found', description: `Receipt #${sale.receiptNumber}` });
      } else {
        setFoundSale(null);
        toast({ title: 'Not Found', description: 'No sale found with that receipt number.', variant: 'destructive' });
      }
    } catch (error) {
      setFoundSale(null);
      toast({ title: 'Error', description: 'Failed to fetch sale from server.', variant: 'destructive' });
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setFoundSale(null);
  };

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="glass-effect border-amber-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Reprint Receipt</DialogTitle>
            <DialogDescription className="text-amber-200/80">
              Enter a receipt number to find and reprint a past sale.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Receipt Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {foundSale && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-black/20 rounded-lg border border-amber-800/30 space-y-3"
              >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-amber-100">Sale Found: #{foundSale.receiptNumber}</h3>
                        <p className="text-sm text-amber-200/80">{new Date(foundSale.timestamp).toLocaleString()}</p>
                    </div>
                     <Button variant="ghost" size="sm" onClick={clearSearch} className="p-1 h-auto text-amber-200 hover:bg-red-950/50">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="text-sm text-amber-200/70">
                    {foundSale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-800/30">
                    <p className="font-bold text-amber-100">Total: UGX {foundSale.total.toLocaleString()}</p>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print This Receipt
                    </Button>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="hidden">
        <Receipt ref={receiptRef} sale={foundSale} isDuplicate={true} />
      </div>
    </>
  );
};

export default ReprintReceiptModal;