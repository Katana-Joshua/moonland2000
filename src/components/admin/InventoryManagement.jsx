import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import { useBusiness } from '@/contexts/BusinessContext.jsx';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Plus, FolderPlus, Upload, Search, FileSpreadsheet, FileText, List, LayoutGrid } from 'lucide-react';
import InventoryForm from '@/components/admin/inventory/InventoryForm';
import CategoryManager from '@/components/admin/inventory/CategoryManager';
import InventoryList from '@/components/admin/inventory/InventoryList';
import DataImporter from '@/components/admin/DataImporter';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { exportInventoryToPDF, exportInventoryToExcel } from '@/components/admin/reports/inventoryExporter';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import InventoryItemCard from '@/components/admin/inventory/InventoryItemCard';

const InventoryManagement = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, bulkAddInventory } = usePOS();
  const { businessType } = useBusiness();
  const { formatCurrency } = useCurrency();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const inventoryLabel = businessType?.features?.inventoryLabel || 'Inventory';
  const itemLabel = inventoryLabel.endsWith('s') ? inventoryLabel.slice(0, -1) : 'Item';

  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    const lowercasedFilter = searchTerm.toLowerCase();
    return inventory.filter(item =>
      item.name.toLowerCase().includes(lowercasedFilter) ||
      (item.category && item.category.toLowerCase().includes(lowercasedFilter)) ||
      (item.barcode && item.barcode.toLowerCase().includes(lowercasedFilter))
    );
  }, [inventory, searchTerm]);

  const handleAdd = (formData) => {
    addInventoryItem(formData);
    setIsAddDialogOpen(false);
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (formData) => {
    updateInventoryItem(editingItem.id, formData);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(id);
    }
  };

  const handleImport = (data) => {
    bulkAddInventory(data);
    setIsImportDialogOpen(false);
  };

  const handleExport = (type) => {
    if(inventory.length === 0){
        toast({ title: 'No Data', description: `No ${inventoryLabel.toLowerCase()} to export.`, variant: 'destructive'});
        return;
    }
    if (type === 'pdf') {
      exportInventoryToPDF(inventory);
      toast({ title: 'PDF Exported', description: 'Inventory list has been downloaded.' });
    } else if (type === 'excel') {
      exportInventoryToExcel(inventory);
      toast({ title: 'Excel Exported', description: 'Inventory list has been downloaded.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-amber-100">{inventoryLabel} Management</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handleExport('pdf')} className="border-red-800/50 text-red-100 hover:bg-red-900/50 hover:text-red-50">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
           <Button variant="outline" onClick={() => handleExport('excel')} className="border-green-800/50 text-green-100 hover:bg-green-900/50 hover:text-green-50">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-800/50 text-blue-100 hover:bg-blue-900/50 hover:text-blue-50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-blue-800/50">
              <DialogHeader>
                <DialogTitle className="text-blue-100">Import {inventoryLabel}</DialogTitle>
              </DialogHeader>
              <DataImporter dataType="inventory" onImport={handleImport} />
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-amber-800/50 text-amber-100">
                <FolderPlus className="w-4 h-4 mr-2" />
                Categories
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

      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
          <Input
            type="text"
            placeholder="Search by name, category, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
          />
        </div>
        <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-5 w-5" />
            </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <InventoryList 
          inventory={filteredInventory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="bg-black/20 rounded-lg border border-amber-800/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.stock <= item.lowStockAlert 
                        ? 'bg-red-800/50 text-red-300' 
                        : 'bg-green-800/50 text-green-300'
                    }`}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.price * item.stock)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="border-amber-700 hover:bg-amber-900/50"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="border-red-700 hover:bg-red-950/50 text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Edit {itemLabel}</DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;