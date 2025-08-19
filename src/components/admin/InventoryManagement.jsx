import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import { useBusiness } from '@/contexts/BusinessContext.jsx';
import { Plus, FolderPlus, Upload } from 'lucide-react';
import InventoryForm from '@/components/admin/inventory/InventoryForm';
import CategoryManager from '@/components/admin/inventory/CategoryManager';
import InventoryList from '@/components/admin/inventory/InventoryList';
import DataImporter from '@/components/admin/DataImporter';
import { Input } from '@/components/ui/input';

const InventoryManagement = () => {
  const { addInventoryItem } = usePOS();
  const { businessType } = useBusiness();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const inventoryLabel = businessType?.features?.inventoryLabel || 'Inventory';
  const itemLabel = inventoryLabel.endsWith('s') ? inventoryLabel.slice(0, -1) : 'Item';

  const handleAdd = async (formData) => {
    const result = await addInventoryItem(formData);
    if (result) {
      setIsAddDialogOpen(false);
    }
  };

  const handleImport = async (importedData) => {
    try {
      for (const item of importedData) {
        await addInventoryItem({
          ...item,
          price: parseFloat(item.price) || 0,
          costPrice: parseFloat(item.costPrice) || 0,
          stock: parseInt(item.stock) || 0,
          lowStockAlert: parseInt(item.lowStockAlert) || 5,
        });
      }
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-amber-100">{inventoryLabel} Management</h2>
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
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-amber-800/50 text-amber-100">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-amber-800/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Import {inventoryLabel} Data</DialogTitle>
              </DialogHeader>
              <DataImporter dataType="inventory" onImport={handleImport} />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Add {itemLabel}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-amber-800/50">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Add New {itemLabel}</DialogTitle>
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