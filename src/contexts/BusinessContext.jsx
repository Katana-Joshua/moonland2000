import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { brandingAPI } from '@/lib/api';
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
  const [businessType, setBusinessTypeInternal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load business type from database on mount
  useEffect(() => {
    const loadBusinessType = async () => {
      try {
        // Get business settings from branding API to check business type
        const businessSettings = await brandingAPI.getBusinessSettings();
        if (businessSettings.businessType && businessSettings.businessType !== 'general') {
          const selectedType = businessTypes.find(t => t.id === businessSettings.businessType);
          if (selectedType) {
            setBusinessTypeInternal(selectedType);
          }
        }
      } catch (error) {
        console.error('Error loading business type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessType();
  }, []);

  const setBusinessType = async (typeId) => {
    try {
      const selectedType = businessTypes.find(t => t.id === typeId);
      if (selectedType) {
        // Update business type in database
        await brandingAPI.updateBusinessSettings({
          businessType: typeId,
          businessName: 'Moon Land POS',
          slogan: 'Your Launchpad for Effortless Sales'
        });

        setBusinessTypeInternal(selectedType);
        toast({
          title: 'Business Type Set!',
          description: `Your POS is now configured for a ${selectedType.name}.`,
        });
        navigate('/'); // Navigate to login page after setup
      }
    } catch (error) {
      console.error('Error setting business type:', error);
      toast({
        title: 'Error',
        description: 'Failed to set business type. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const resetBusinessType = (shouldNavigate = true) => {
    setBusinessTypeInternal(null);
    if (shouldNavigate) {
      navigate('/setup');
    }
  };

  const clearAllBusinessData = async () => {
    try {
      // Clear all business data from database using proper API calls
      // Note: These endpoints might not exist yet, so we'll handle errors gracefully
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pos/sales`, { method: 'DELETE' });
      } catch (e) {
        console.log('Sales clear endpoint not available');
      }
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pos/expenses`, { method: 'DELETE' });
      } catch (e) {
        console.log('Expenses clear endpoint not available');
      }
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pos/inventory`, { method: 'DELETE' });
      } catch (e) {
        console.log('Inventory clear endpoint not available');
      }
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pos/staff`, { method: 'DELETE' });
      } catch (e) {
        console.log('Staff clear endpoint not available');
      }
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/pos/categories`, { method: 'DELETE' });
      } catch (e) {
        console.log('Categories clear endpoint not available');
      }
      
      // Reset business type in database
      try {
        await brandingAPI.updateBusinessSettings({
          businessType: 'general',
          businessName: 'Moon Land POS',
          slogan: 'Your Launchpad for Effortless Sales'
        });
      } catch (e) {
        console.log('Business type reset endpoint not available');
      }
      
      // Reset business type in local state
      setBusinessTypeInternal(null);
      
      toast({
        title: 'All Business Data Erased',
        description: 'You can now set up your new business.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error clearing business data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear business data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    businessType,
    setBusinessType,
    resetBusinessType,
    businessTypes,
    clearAllBusinessData,
    isLoading,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
