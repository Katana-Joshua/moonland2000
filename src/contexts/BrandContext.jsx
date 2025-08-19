import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  const [branding, setBranding] = useLocalStorage('moonland_branding', {
    logo: null,
    businessName: 'Moon Land POS',
    slogan: 'Your Launchpad for Effortless Sales',
  });

  const updateBranding = (newBranding) => {
    setBranding(newBranding);
    toast({
      title: 'Branding Updated',
      description: 'Your business branding has been saved successfully.',
    });
  };

  const LogoComponent = branding.logo 
    ? ({ className }) => <img src={branding.logo} alt={`${branding.businessName} logo`} className={className} />
    : ({ className }) => <Moon className={className} />;

  const value = {
    branding,
    updateBranding,
    LogoComponent,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};
