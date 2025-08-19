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

  // Fetch branding data from database
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setIsLoading(true);
        const businessSettings = await brandingAPI.getBusinessSettings();
        const brandingAssets = await brandingAPI.getBrandingAssets();
        
        // Find logo asset
        const logoAsset = brandingAssets.find(asset => asset.asset_type === 'logo');
        
        setBranding({
          ...businessSettings,
          logo: logoAsset ? brandingAPI.getBrandingAssetUrl('logo') : null
        });
      } catch (error) {
        console.error('Error fetching branding:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, []);

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
    isLoading
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};
