import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';
import { 
  Utensils, 
  GlassWater, 
  Building2, 
  ShoppingCart, 
  Bath as Spa, 
  Scissors,
  Shirt,
  Wrench,
  Hammer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const businessTypes = [
  { id: 'restaurant', name: 'Restaurant', icon: Utensils, features: { inventoryLabel: 'Menu Items' } },
  { id: 'bar', name: 'Bar / Lounge', icon: GlassWater, features: { inventoryLabel: 'Inventory' } },
  { id: 'hotel', name: 'Hotel', icon: Building2, features: { inventoryLabel: 'Room Service Items' } },
  { id: 'supermarket', name: 'Supermarket', icon: ShoppingCart, features: { inventoryLabel: 'Products' } },
  { id: 'clothing', name: 'Clothes / Shoes', icon: Shirt, features: { inventoryLabel: 'Stock' } },
  { id: 'spares', name: 'Auto Spares', icon: Wrench, features: { inventoryLabel: 'Parts' } },
  { id: 'hardware', name: 'Hardware', icon: Hammer, features: { inventoryLabel: 'Products' } },
  { id: 'spa', name: 'Spa', icon: Spa, features: { inventoryLabel: 'Services & Products' } },
  { id: 'saloon', name: 'Saloon', icon: Scissors, features: { inventoryLabel: 'Services & Products' } },
];

export const BusinessProvider = ({ children }) => {
  const [businessType, setBusinessTypeInternal] = useLocalStorage('moonland_business_type', null);
  const navigate = useNavigate();

  const setBusinessType = (typeId) => {
    const selectedType = businessTypes.find(t => t.id === typeId);
    if (selectedType) {
      setBusinessTypeInternal(selectedType);
      toast({
        title: 'Business Type Set!',
        description: `Your POS is now configured for a ${selectedType.name}.`,
      });
      navigate('/'); // Navigate to login page after setup
    }
  };
  
  const resetBusinessType = (shouldNavigate = true) => {
    setBusinessTypeInternal(null);
    if (shouldNavigate) {
      navigate('/setup');
    }
  };

  const clearAllBusinessData = () => {
    const keysToClear = [
      'moonland_cart',
      'moonland_shift',
      'moonland_expenses',
      'moonland_credit_sales',
      'moonland_inventory',
      'moonland_categories',
      'moonland_staff',
      'moonland_sales',
    ];
    
    keysToClear.forEach(key => {
      localStorage.removeItem(key);
    });

    toast({
      title: 'All Business Data Erased',
      description: 'You can now set up your new business.',
      variant: 'destructive',
    });
  };

  const value = {
    businessType,
    setBusinessType,
    resetBusinessType,
    businessTypes,
    clearAllBusinessData,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
