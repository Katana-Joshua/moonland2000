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
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('moonland_token');
    return !!token;
  };

  // Fetch branding data from database immediately on app startup (for public display)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setIsLoading(true);
        console.log('🌐 Fetching branding data for public display...');
        
        const businessSettings = await brandingAPI.getBusinessSettings();
        console.log('📊 Business settings received:', businessSettings);
        
        const brandingAssets = await brandingAPI.getBrandingAssets();
        console.log('📁 Branding assets received:', brandingAssets);
        
        // Find logo asset
        const logoAsset = brandingAssets.find(asset => asset.asset_type === 'logo');
        console.log('🖼️ Logo asset found:', logoAsset);
        
        const newBranding = {
          ...businessSettings,
          logo: logoAsset ? brandingAPI.getBrandingAssetUrl('logo') : null
        };
        
        console.log('🎨 Final branding object:', newBranding);
        setBranding(newBranding);
        
        setIsInitialized(true);
        console.log('✅ Branding data loaded successfully for public display');
      } catch (error) {
        console.error('❌ Error fetching branding for public display:', error);
        // Keep default values on error, but mark as initialized
        setIsInitialized(true);
        console.log('🔄 Using default branding values');
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch branding data on app startup (public data)
    fetchBranding();
  }, []); // Empty dependency array - runs once on mount

  // Listen for authentication changes to refresh branding data
  useEffect(() => {
    const handleStorageChange = () => {
      if (isAuthenticated() && isInitialized) {
        // User just logged in, refresh branding data
        console.log('🔐 User logged in, refreshing branding data...');
        setIsInitialized(false);
        // This will trigger the first useEffect to run again
      } else if (!isAuthenticated() && isInitialized) {
        // User just logged out, keep current branding (it's public data)
        console.log('🚪 User logged out, keeping current branding');
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

  const LogoComponent = ({ className }) => {
    console.log('🖼️ LogoComponent rendered with:', { logo: branding.logo, businessName: branding.businessName });
    
    if (branding.logo) {
      return <img src={branding.logo} alt={`${branding.businessName} logo`} className={className} />;
    } else {
      return <Moon className={className} />;
    }
  };

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
