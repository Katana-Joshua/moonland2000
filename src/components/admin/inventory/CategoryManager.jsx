import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Edit, Trash2, ImagePlus } from 'lucide-react';

const CategoryManager = () => {
  const { categories, addCategory, removeCategory, updateCategory } = usePOS();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const categoryFileInputRef = useRef(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // Check if category already exists
      const exists = categories.find(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase());
      if (exists) {
        alert('Category already exists!');
        return;
      }
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file && editingCategory) {
      console.log('📁 Updating category image:', editingCategory.name, file.name);
      
      // Update category with file upload
      updateCategory(editingCategory.id, { 
        name: editingCategory.name,
        imageFile: file 
      });
      
      // Reset editing state
      setEditingCategory(null);
    }
  };

  const openCategoryEdit = (category) => {
    setEditingCategory(category);
    categoryFileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="bg-black/20 border-amber-800/50 text-amber-100"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddCategory();
            }
          }}
        />
        <Button 
          onClick={handleAddCategory} 
          className="bg-amber-600 hover:bg-amber-700"
          disabled={!newCategory.trim()}
        >
          Add
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {categories.map(cat => (
          <div key={cat.id || cat.name} className="flex items-center justify-between p-3 bg-black/20 rounded-md hover:bg-black/30 transition-colors border border-amber-800/20">
            <div className="flex items-center gap-3">
              {cat.image_url ? (
                <img 
                  src={cat.image_url.startsWith('/uploads/') ? `http://localhost:5000${cat.image_url}` : cat.image_url} 
                  alt={cat.name} 
                  className="w-12 h-12 rounded-md object-cover border border-amber-800/30"
                  onError={(e) => {
                    console.error('Category image failed to load:', cat.name, 'URL:', e.target.src);
                    // Try proxy URL as fallback
                    if (e.target.src.includes('/uploads/') && !e.target.src.includes('/api/images/')) {
                      const proxyUrl = e.target.src.replace('/uploads/', '/api/images/');
                      console.log('Trying proxy URL as fallback:', proxyUrl);
                      e.target.src = proxyUrl;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                  onLoad={() => console.log('✅ Category image loaded successfully:', cat.name)}
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-amber-950/50 flex items-center justify-center border border-amber-800/30">
                  <ImagePlus className="w-6 h-6 text-amber-500" />
                </div>
              )}
              <span className="text-amber-100 font-medium">{cat.name}</span>
            </div>
            <div className="flex items-center">
              <Button size="sm" variant="ghost" onClick={() => openCategoryEdit(cat)}>
                <Edit className="w-4 h-4 text-amber-400" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${cat.name}"? This will also remove it from all inventory items.`)) {
                    removeCategory(cat.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
        <input
          type="file"
          ref={categoryFileInputRef}
          onChange={handleCategoryImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CategoryManager;