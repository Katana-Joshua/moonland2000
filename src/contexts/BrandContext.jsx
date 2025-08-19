import React, { createContext, useContext, useState, useEffect } from 'react';
import { brandingAPI } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Moon } from 'lucide-react';

const BrandContext = createContext();

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export const BrandProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    logo: null,
    businessName: 'Moon Land POS',
    slogan: 'Your Launchpad for Effortless Sales',
    address: '123 Cosmic Way, Galaxy City',
    phone: '+123 456 7890',
    email: 'info@moonland.com',
    website: 'www.moonland.com',
    tax_rate: 0.00,
    currency: 'UGX',
    timezone: 'Africa/Kampala'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('moonland_token');
    return !!token;
  };

  // Fetch branding data from database only when authenticated
  useEffect(() => {
    const fetchBranding = async () => {
      // Only fetch if user is authenticated and we haven't initialized yet
      if (!isAuthenticated() || isInitialized) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔐 Fetching branding data for authenticated user...');
        
        const businessSettings = await brandingAPI.getBusinessSettings();
        const brandingAssets = await brandingAPI.getBrandingAssets();
        
        // Find logo asset
        const logoAsset = brandingAssets.find(asset => asset.asset_type === 'logo');
        
        setBranding({
          ...businessSettings,
          logo: logoAsset ? brandingAPI.getBrandingAssetUrl('logo') : null
        });
        
        setIsInitialized(true);
        console.log('✅ Branding data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching branding:', error);
        // Keep default values on error, but mark as initialized
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [isInitialized]);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (isAuthenticated() && !isInitialized) {
        // User just logged in, fetch branding data
        setIsInitialized(false);
      } else if (!isAuthenticated() && isInitialized) {
        // User just logged out, reset to defaults
        setBranding({
          logo: null,
          businessName: 'Moon Land POS',
          slogan: 'Your Launchpad for Effortless Sales',
          address: '123 Cosmic Way, Galaxy City',
          phone: '+123 456 7890',
          email: 'info@moonland.com',
          website: 'www.moonland.com',
          tax_rate: 0.00,
          currency: 'UGX',
          timezone: 'Africa/Kampala'
        });
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

  const updateBranding = async (newBranding) => {
    try {
      // Update business settings
      await brandingAPI.updateBusinessSettings(newBranding);
      
      // Update logo if provided
      if (newBranding.logoFile) {
        await brandingAPI.uploadBrandingAsset('logo', newBranding.logoFile);
        newBranding.logo = brandingAPI.getBrandingAssetUrl('logo');
        delete newBranding.logoFile; // Remove file object
      }
      
      setBranding(newBranding);
      toast({
        title: 'Branding Updated',
        description: 'Your business branding has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating branding:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update branding. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const LogoComponent = branding.logo 
    ? ({ className }) => <img src={branding.logo} alt={`${branding.businessName} logo`} className={className} />
    : ({ className }) => <Moon className={className} />;

  const value = {
    branding,
    updateBranding,
    LogoComponent,
    isLoading,
    isInitialized
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};
