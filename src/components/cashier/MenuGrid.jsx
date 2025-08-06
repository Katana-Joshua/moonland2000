
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { Plus, Search, Image as ImageIcon, Barcode, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { buildImageUrl } from '@/lib/api';

const MenuGrid = () => {
  const { inventory, addToCart, categories } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [barcode, setBarcode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoriesRef = useRef(null);

  const displayCategories = [{ name: 'All', image: null }, ...categories];

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      const currentScroll = categoriesRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoriesRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!barcode) return;

    const item = inventory.find(i => i.barcode === barcode);
    if (item) {
      addToCart(item);
      toast({
        title: "Item Added",
        description: `${item.name} added to cart.`,
      });
      setBarcode('');
    } else {
      toast({
        title: "Item Not Found",
        description: `No item with barcode "${barcode}" found.`,
        variant: "destructive",
      });
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.stock > 0;
  });

  return (
    <div className="space-y-5">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
          <Input
            type="search"
            inputMode="search"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50 h-10"
          />
        </div>
        <form onSubmit={handleBarcodeScan} className="relative flex-1">
          <Barcode className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
          <Input
            type="text"
            placeholder="Scan barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="pl-10 bg-black/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50 h-10"
          />
        </form>
      </div>
      
      {/* Category Filter with Scroll Buttons */}
      <div className="relative group">
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollCategories('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/70 hover:bg-black/90 text-amber-400 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-amber-800/50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollCategories('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/70 hover:bg-black/90 text-amber-400 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-amber-800/50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div 
          ref={categoriesRef}
          className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        >
          {displayCategories.map(category => (
            <motion.div
              key={category.name}
              whileHover={{ y: -2 }}
              className="flex-shrink-0"
            >
              <button
                onClick={() => setSelectedCategory(category.name)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  selectedCategory === category.name 
                    ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/25' 
                    : 'border-transparent hover:border-amber-700'
                }`}
              >
                {category.image ? (
                  <img 
                    src={buildImageUrl(category.image)} 
                    alt={category.name} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('✅ Cashier category image loaded:', category.name)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center">
                    <span className="text-amber-200 font-bold text-sm">{category.name}</span>
                  </div>
                )}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === category.name 
                    ? 'bg-black/30' 
                    : 'bg-black/50 hover:bg-black/40'
                }`}>
                  <span className="text-white font-bold text-center text-sm drop-shadow-md">{category.name}</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass-effect border-amber-800/50 hover:border-amber-600/50 transition-all cursor-pointer group h-full">
              <CardContent className="p-4">
                <div className="aspect-[4/3] mb-3 overflow-hidden rounded-lg">
                  {item.image ? (
                    <img
                      src={buildImageUrl(item.image)}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => console.log('Cashier image loaded successfully for:', item.name)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center">
                      <span className="text-amber-300 text-3xl font-bold">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-100 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-amber-200/80">{item.category}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-amber-100">
                      UGX {item.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-amber-200/60">
                      Stock: {item.stock}
                    </span>
                  </div>

                  <Button
                    onClick={() => addToCart(item)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    disabled={item.stock === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-amber-200/60">No items found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
