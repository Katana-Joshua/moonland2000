
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/contexts/POSContext.jsx';
import { toast } from '@/components/ui/use-toast';

const InventoryForm = ({ item, onSubmit, onCancel }) => {
  const { categories } = usePOS();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    lowStockAlert: '',
    imageFile: null,
    barcode: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        price: item.price?.toString() || '',
        costPrice: item.costPrice?.toString() || '',
        stock: item.stock?.toString() || '',
        lowStockAlert: item.lowStockAlert?.toString() || '',
        imageFile: null,
        barcode: item.barcode || ''
      });
      setPreviewImage(item.image || null);
    }
  }, [item]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, imageFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.costPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Price, Cost Price, Stock)",
        variant: "destructive"
      });
      return;
    }

    // Find category ID by name
    const selectedCategory = categories.find(cat => cat.name === formData.category);
    const categoryId = selectedCategory ? selectedCategory.id : null;

    onSubmit({
      name: formData.name,
      description: formData.description || '',
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
      stock: parseInt(formData.stock),
      lowStockAlert: parseInt(formData.lowStockAlert) || 5,
      categoryId: categoryId,
      imageFile: formData.imageFile, // Send the actual file
      imageUrl: formData.image || null, // Keep existing image URL as fallback
      barcode: formData.barcode || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-amber-200">Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            required
          />
        </div>
        <div>
          <Label className="text-amber-200">Category</Label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-10 px-3 rounded-md bg-black/20 border border-amber-800/50 text-amber-100"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-amber-200">Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-black/20 border-amber-800/50 text-amber-100"
          placeholder="Item description..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-amber-200">Selling Price (UGX) *</Label>
          <Input
            type="number"
            step="100"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            required
          />
        </div>
        <div>
          <Label className="text-amber-200">Cost Price (UGX) *</Label>
          <Input
            type="number"
            step="100"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-amber-200">Stock *</Label>
          <Input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            required
          />
        </div>
        <div>
          <Label className="text-amber-200">Low Stock Alert</Label>
          <Input
            type="number"
            value={formData.lowStockAlert}
            onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="5"
          />
        </div>
      </div>
      <div>
        <Label className="text-amber-200">Barcode (UPC/EAN)</Label>
        <Input
          value={formData.barcode}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          className="bg-black/20 border-amber-800/50 text-amber-100"
          placeholder="e.g. 123456789012"
        />
      </div>
      <div>
        <Label className="text-amber-200">Image</Label>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="bg-black/20 border-amber-800/50 text-amber-100 file:text-amber-200 file:bg-amber-800/50 file:border-0 file:rounded-md file:mr-2 file:px-2"
        />
        {previewImage && (
          <img src={previewImage} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
          {item ? "Update Item" : "Add Item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
