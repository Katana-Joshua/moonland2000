import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOS } from '@/contexts/POSContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/components/ui/use-toast';
import { Search, X, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SalesReturnModal = ({ isOpen, onClose }) => {
  const { sales, processReturn } = usePOS();
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundSale, setFoundSale] = useState(null);

  const handleSearch = () => {
    if (!searchQuery) return;
    const sale = sales.find(s => s.receiptNumber?.toString() === searchQuery.toString() && s.type !== 'return');
    if (sale) {
      if (sales.some(s => s.originalSaleId === sale.id)) {
        toast({ title: 'Already Returned', description: 'This sale has already been returned.', variant: 'destructive' });
        setFoundSale(null);
      } else {
        setFoundSale(sale);
        toast({ title: 'Sale Found', description: `Receipt #${sale.receiptNumber}` });
      }
    } else {
      setFoundSale(null);
      toast({ title: 'Not Found', description: 'No valid sale found with that receipt number.', variant: 'destructive' });
    }
  };

  const handleReturn = () => {
    if (!foundSale) return;
    processReturn(foundSale.id);
    handleClose();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect border-amber-800/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-100">Process a Sales Return</DialogTitle>
          <DialogDescription className="text-amber-200/80">
            Enter a receipt number to find a sale and process a return. This will add the items back to inventory.
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
                  <p className="font-bold text-amber-100">Total: {formatCurrency(foundSale.total)}</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Process Return
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-effect border-red-800/50">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-100">Confirm Sales Return</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-200/80">
                          Are you sure you want to reverse this transaction? The items will be returned to stock, and a refund of <strong className="text-red-100">{formatCurrency(foundSale.total)}</strong> will be recorded. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReturn} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, Confirm Return
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesReturnModal;
