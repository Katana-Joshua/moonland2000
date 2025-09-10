import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Truck, UserPlus, ArrowLeft } from 'lucide-react';
import PurchaseOrderForm from '@/components/admin/purchases/PurchaseOrderForm';
import PurchaseOrderList from '@/components/admin/purchases/PurchaseOrderList';
import SupplierForm from '@/components/admin/purchases/SupplierForm';
import SupplierList from '@/components/admin/purchases/SupplierList';
import { usePOS } from '@/contexts/POSContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PurchasesPage = () => {
  const [isPurchaseOrderDialogOpen, setIsPurchaseOrderDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const { addPurchaseOrder, addSupplier } = usePOS();
  const navigate = useNavigate();

  const handleAddPurchaseOrder = (order) => {
    addPurchaseOrder(order);
    setIsPurchaseOrderDialogOpen(false);
  };
  
  const handleAddSupplier = (supplier) => {
    addSupplier(supplier);
    setIsSupplierDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-amber-800/50 text-amber-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <h1 className="text-3xl font-bold text-amber-100">Purchases & Suppliers</h1>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" /> Add Supplier
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect">
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <SupplierForm onSubmit={handleAddSupplier} onCancel={() => setIsSupplierDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isPurchaseOrderDialogOpen} onOpenChange={setIsPurchaseOrderDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Create Purchase Order
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Purchase Order</DialogTitle>
                    </DialogHeader>
                    <PurchaseOrderForm onSubmit={handleAddPurchaseOrder} onCancel={() => setIsPurchaseOrderDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-amber-800/50">
          <TabsTrigger value="orders"><Truck className="w-4 h-4 mr-2"/>Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers"><UserPlus className="w-4 h-4 mr-2"/>Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6">
           <PurchaseOrderList />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
            <SupplierList />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default PurchasesPage;
