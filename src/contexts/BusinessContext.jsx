import React, { createContext, useContext, useState, useEffect } from 'react';
import { brandingAPI } from '@/lib/api';
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
  const [businessType, setBusinessTypeInternal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('moonland_token');
    return !!token;
  };

  // Fetch business type from database only when authenticated
  useEffect(() => {
    const fetchBusinessType = async () => {
      // Only fetch if user is authenticated and we haven't initialized yet
      if (!isAuthenticated() || isInitialized) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔐 Fetching business type for authenticated user...');
        
        const businessSettings = await brandingAPI.getBusinessSettings();
        if (businessSettings.business_type && businessSettings.business_type !== 'general') {
          const selectedType = businessTypes.find(t => t.id === businessSettings.business_type);
          if (selectedType) {
            setBusinessTypeInternal(selectedType);
          }
        }
        
        setIsInitialized(true);
        console.log('✅ Business type loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching business type:', error);
        // Mark as initialized even on error
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessType();
  }, [isInitialized]);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (isAuthenticated() && !isInitialized) {
        // User just logged in, fetch business type
        setIsInitialized(false);
      } else if (!isAuthenticated() && isInitialized) {
        // User just logged out, reset to defaults
        setBusinessTypeInternal(null);
        setIsInitialized(false);
      }
    };

    // Listen for storage changes (login/logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (in case of multiple tabs)
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [isInitialized]);

  const setBusinessType = async (typeId) => {
    try {
      const selectedType = businessTypes.find(t => t.id === typeId);
      if (selectedType) {
        // Update database
        await brandingAPI.updateBusinessSettings({ business_type: typeId });
        
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
        variant: 'destructive'
      });
    }
  };
  
  const resetBusinessType = async (shouldNavigate = true) => {
    try {
      // Reset in database
      await brandingAPI.updateBusinessSettings({ business_type: 'general' });
      
      setBusinessTypeInternal(null);
      if (shouldNavigate) {
        navigate('/setup');
      }
    } catch (error) {
      console.error('Error resetting business type:', error);
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
    isLoading
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
