import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUpload from '@/components/ui/image-upload';
import { usePOS } from '@/contexts/POSContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Plus, Image as ImageIcon } from 'lucide-react';

const InventoryForm = () => {
  const { addInventoryItem } = usePOS();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    minPrice: '',
    stock: '',
    lowStockAlert: '5',
    categoryId: '',
    imageUrl: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      minPrice: '',
      stock: '',
      lowStockAlert: '5',
      categoryId: '',
      imageUrl: ''
    });
    setUploadedImage(null);
  };

  const handleImageUpload = (data) => {
    // Use WebP version if available, otherwise JPEG
    const imageUrl = data.webp?.url || data.jpeg?.url;
    setFormData(prev => ({ ...prev, imageUrl }));
    setUploadedImage(data);
    
    toast({
      title: "Image uploaded successfully",
      description: `Compression: ${data.metadata.compressionRatio} - Size: ${(data.metadata.optimizedSize / 1024).toFixed(1)}KB`
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.costPrice || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const item = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
      stock: parseInt(formData.stock),
      lowStockAlert: parseInt(formData.lowStockAlert),
      categoryId: formData.categoryId || null,
      imageUrl: formData.imageUrl
    };

    addInventoryItem(item);
    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-100">Add New Inventory Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-amber-200">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                  placeholder="Item name"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-amber-200">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                  placeholder="Item description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-amber-200">Selling Price (UGX) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="costPrice" className="text-amber-200">Cost Price (UGX) *</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="minPrice" className="text-amber-200">Minimum Price (UGX)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  value={formData.minPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Management */}
          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg">Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock" className="text-amber-200">Current Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lowStockAlert" className="text-amber-200">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData(prev => ({ ...prev, lowStockAlert: e.target.value }))}
                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                    placeholder="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-amber-100 text-lg flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={handleImageUpload}
                multiple={false}
                maxSize={5}
                optimizationOptions={{
                  maxWidth: 800,
                  maxHeight: 800,
                  quality: 80,
                  formats: ['webp', 'jpeg'],
                  thumbnail: true
                }}
              />
              
              {uploadedImage && (
                <div className="mt-4 p-3 bg-green-950/20 border border-green-800/30 rounded-lg">
                  <p className="text-green-200 text-sm">
                    ✅ Image optimized successfully
                  </p>
                  <p className="text-green-300/70 text-xs">
                    Compression: {uploadedImage.metadata.compressionRatio} | 
                    Size: {(uploadedImage.metadata.optimizedSize / 1024).toFixed(1)}KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryForm; 