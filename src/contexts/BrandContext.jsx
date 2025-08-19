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
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch branding data from database on EVERY mount (like receipt settings)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setIsLoading(true);
        
        const businessSettings = await brandingAPI.getBusinessSettings();
        
        const brandingAssets = await brandingAPI.getBrandingAssets();
        
        // Find logo asset
        const logoAsset = brandingAssets.find(asset => asset.asset_type === 'logo');
        
        const newBranding = {
          ...businessSettings,
          logo: logoAsset ? brandingAPI.getBrandingAssetUrl('logo') : null
        };
        
        setBranding(newBranding);
        setHasLoaded(true);
      } catch (error) {
        console.error('❌ BrandContext: Error fetching branding:', error);
        setHasLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    // ALWAYS fetch branding data on mount (public data)
    fetchBranding();
  }, []); // Empty dependency array - runs on every mount

  const updateBranding = async (newBranding) => {
    try {
      // Update business settings first (this should always work)
      const updatedSettings = await brandingAPI.updateBusinessSettings(newBranding);
      
      // Update logo if provided (this is optional and shouldn't block business settings)
      if (newBranding.logoFile) {
        try {
          await brandingAPI.uploadBrandingAsset('logo', newBranding.logoFile);
          delete newBranding.logoFile; // Remove file object
        } catch (logoError) {
          console.error('❌ BrandContext: Logo upload failed:', logoError);
          // Don't fail the entire update if logo upload fails
          toast({
            title: 'Logo Upload Failed',
            description: 'Business settings were saved, but logo upload failed. You can try uploading the logo again later.',
            variant: 'destructive'
          });
          // Remove the logo file from the branding object
          delete newBranding.logoFile;
        }
      }
      
      // IMPORTANT: Refresh branding data from database to get the latest values including logo
      await refreshBranding();
      
      toast({
        title: 'Branding Updated',
        description: 'Your business branding has been saved successfully.',
      });
    } catch (error) {
      console.error('❌ BrandContext: Error updating branding:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update branding. Please try again.',
        variant: 'destructive'
      });
      throw error; // Re-throw so the component can handle it
    }
  };

  const refreshBranding = async () => {
    setIsLoading(true);
    
    try {
      const businessSettings = await brandingAPI.getBusinessSettings();
      
      const brandingAssets = await brandingAPI.getBrandingAssets();
      
      // Find logo asset
      const logoAsset = brandingAssets.find(asset => asset.asset_type === 'logo');
      
      // Build the complete branding object
      const newBranding = {
        ...businessSettings,
        logo: logoAsset ? brandingAPI.getBrandingAssetUrl('logo') : null
      };
      
      setBranding(newBranding);
    } catch (error) {
      console.error('❌ BrandContext: Error refreshing branding:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh branding data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const LogoComponent = ({ className }) => {
    
    if (branding.logo) {
      return <img src={branding.logo} alt={`${branding.businessName} logo`} className={className} />;
    } else {
      return <Moon className={className} />;
    }
  };

  const value = {
    branding,
    updateBranding,
    refreshBranding,
    LogoComponent,
    isLoading,
    hasLoaded
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};
