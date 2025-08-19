import React, { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ImageDown as ImageUp, Save, Building } from 'lucide-react';

const BrandingSettings = () => {
  const { branding, updateBranding, refreshBranding, LogoComponent, isLoading, hasLoaded } = useBrand();
  const [settings, setSettings] = useState(branding);
  const [logoPreview, setLogoPreview] = useState(branding.logo);

  // Sync local state with branding context whenever branding changes
  useEffect(() => {
    console.log('🔄 BrandingSettings: Syncing with context:', branding);
    setSettings(branding);
    setLogoPreview(branding.logo);
  }, [branding]);

  // Show loading state until data is loaded from database
  if (!hasLoaded) {
    return (
      <Card className="glass-effect border-amber-800/50 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-amber-100 text-2xl flex items-center">
            <Building className="w-6 h-6 mr-3 text-amber-400" />
            Business Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-amber-300">
            🔄 Loading branding data from database...
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('🖼️ BrandingSettings: Logo file selected:', file.name, file.size, file.type);
      
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: "File too large",
          description: "Please upload a logo smaller than 1MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Create preview for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        console.log('🖼️ BrandingSettings: Logo preview created');
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for upload
      setSettings(prev => ({ 
        ...prev, 
        logoFile: file 
      }));
      console.log('🖼️ BrandingSettings: Logo file stored in settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 BrandingSettings: Submitting form with settings:', settings);
    
    try {
      // Create a copy of settings for submission
      const submissionData = { ...settings };
      
      // If there's a logo file, add it to the submission
      if (settings.logoFile) {
        submissionData.logoFile = settings.logoFile;
        console.log('🖼️ BrandingSettings: Logo file included in submission:', settings.logoFile.name);
      }
      
      console.log('📤 BrandingSettings: Submitting data:', submissionData);
      await updateBranding(submissionData);
      console.log('✅ BrandingSettings: Form submitted successfully');
      
      // Clear the logo file after successful submission
      if (settings.logoFile) {
        setSettings(prev => ({ ...prev, logoFile: null }));
        setLogoPreview(branding.logo); // Reset to current logo
      }
    } catch (error) {
      console.error('❌ BrandingSettings: Form submission failed:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update branding. Please check the console for details.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="glass-effect border-amber-800/50 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-amber-100 text-2xl flex items-center">
          <Building className="w-6 h-6 mr-3 text-amber-400" />
          Business Branding
        </CardTitle>
        <CardDescription className="text-amber-200/80">
          Customize the look and feel of your POS to match your business.
        </CardDescription>
        {isLoading && (
          <div className="text-amber-300 text-sm">
            🔄 Loading branding data from database...
          </div>
        )}
        {!isLoading && hasLoaded && (
          <div className="text-amber-300 text-sm">
            ✅ Branding data loaded from database
          </div>
        )}
        {!isLoading && !hasLoaded && (
          <div className="text-amber-300 text-sm">
            ⚠️ No branding data loaded yet
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-amber-200">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={settings.businessName || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="Enter business name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan" className="text-amber-200">Slogan (for Login Screen)</Label>
            <Input
              id="slogan"
              name="slogan"
              value={settings.slogan || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="Enter business slogan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-amber-200">Business Address</Label>
            <Input
              id="address"
              name="address"
              value={settings.address || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="Enter business address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-amber-200">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={settings.phone || ''}
                onChange={handleInputChange}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-200">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={settings.email || ''}
                onChange={handleInputChange}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                placeholder="Enter email address"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-amber-200">Website</Label>
            <Input
              id="website"
              name="website"
              value={settings.website || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="Enter website URL"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate" className="text-amber-200">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                name="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.tax_rate || 0}
                onChange={handleInputChange}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-amber-200">Currency</Label>
              <Input
                id="currency"
                name="currency"
                value={settings.currency || 'UGX'}
                onChange={handleInputChange}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                placeholder="UGX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200">Business Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 object-contain rounded-md bg-white p-1 flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <LogoComponent className="w-16 h-16 text-slate-700" />}
              </div>
              <Button asChild variant="outline" className="border-amber-700 hover:bg-amber-900/50">
                <label htmlFor="logo-upload" className="cursor-pointer flex items-center">
                  <ImageUp className="w-4 h-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </label>
              </Button>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoChange} />
            </div>
             <p className="text-xs text-amber-300/60 pt-1">Recommended: Square image (e.g., 200x200px), max 1MB.</p>
          </div>
          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              type="button"
              onClick={refreshBranding}
              className="bg-amber-800 hover:bg-amber-900 text-white font-semibold"
              disabled={isLoading}
            >
              <ImageUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;
