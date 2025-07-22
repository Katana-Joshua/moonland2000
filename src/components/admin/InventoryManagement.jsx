import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Plus, FolderPlus } from 'lucide-react';
import InventoryForm from '@/components/admin/inventory/InventoryForm';
import CategoryManager from '@/components/admin/inventory/CategoryManager';
import InventoryList from '@/components/admin/inventory/InventoryList';
import { Input } from '@/components/ui/input';

const InventoryManagement = () => {
  const { addInventoryItem } = usePOS();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = async (formData) => {
    const result = await addInventoryItem(formData);
    if (result) {
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-amber-100">Inventory Management</h2>
        <div className="flex gap-2 self-start sm:self-center">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-amber-800/50 text-amber-100">
                <FolderPlus className="w-4 h-4 mr-2" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-amber-800/50">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Manage Categories</DialogTitle>
              </DialogHeader>
              <CategoryManager />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-amber-800/50">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Add New Item</DialogTitle>
              </DialogHeader>
              <InventoryForm
                onSubmit={handleAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex mb-4">
        <Input
          type="search"
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-black/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50"
        />
      </div>

      {/* Inventory Grid */}
      <InventoryList searchTerm={searchTerm} />
    </div>
  );
};

export default InventoryManagement;