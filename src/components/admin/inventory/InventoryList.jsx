import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import InventoryItemCard from './InventoryItemCard';
import InventoryForm from './InventoryForm';

const InventoryList = ({ inventory, onEdit, onDelete, searchTerm = '' }) => {
  const { inventory: contextInventory } = usePOS();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Use passed inventory or fall back to context inventory
  const inventoryToUse = inventory || contextInventory;

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    } else {
      setEditingItem(item);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdate = (formData) => {
    // This will only be used if onEdit is not provided
    const { updateInventoryItem } = usePOS();
    updateInventoryItem(editingItem.id, formData);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    } else {
      if (window.confirm('Are you sure you want to delete this item?')) {
        const { deleteInventoryItem } = usePOS();
        deleteInventoryItem(id);
      }
    }
  };

  // Filter inventory by search term if no filtered inventory is passed
  const filteredInventory = inventory || inventoryToUse.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredInventory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InventoryItemCard
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          </motion.div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Edit Item</DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryList;