import React, { useState, useEffect } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ImageDown as ImageUp, Save } from 'lucide-react';

const ReceiptCustomization = () => {
  const { receiptSettings, updateReceiptSettings } = usePOS();
  const [settings, setSettings] = useState({
    ...receiptSettings,
    logoFile: null,
    removeLogo: false
  });
  const [logoPreview, setLogoPreview] = useState(receiptSettings.logo);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with context when receiptSettings change
  useEffect(() => {
    setSettings(prev => ({
      ...receiptSettings,
      logoFile: prev.logoFile,
      removeLogo: prev.removeLogo
    }));
    setLogoPreview(receiptSettings.logo);
  }, [receiptSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for upload
      setSettings(prev => ({ ...prev, logoFile: file }));
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setSettings(prev => ({ ...prev, logoFile: null, removeLogo: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('companyName', settings.companyName || '');
      formData.append('address', settings.address || '');
      formData.append('phone', settings.phone || '');
      formData.append('footer', settings.footer || '');
      
      if (settings.logoFile) {
        formData.append('logo', settings.logoFile);
      }
      
      if (settings.removeLogo) {
        formData.append('removeLogo', 'true');
      }
      
      const success = await updateReceiptSettings(formData);
      if (success) {
        // Clear the logo file and remove flag after successful upload
        setSettings(prev => ({ ...prev, logoFile: null, removeLogo: false }));
      }
    } catch (error) {
      console.error('Error saving receipt settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-effect border-amber-800/50 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-amber-100 text-2xl flex items-center">
          <Save className="w-6 h-6 mr-3 text-amber-400" />
          Receipt Customization
        </CardTitle>
        <CardDescription className="text-amber-200/80">
          Personalize your sales receipts with your company's branding and information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-amber-200">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={settings.companyName || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-amber-200">Address</Label>
            <Input
              id="address"
              name="address"
              value={settings.address || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-amber-200">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={settings.phone || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footer" className="text-amber-200">Receipt Footer Message</Label>
            <Textarea
              id="footer"
              name="footer"
              value={settings.footer || ''}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
              placeholder="Thank you for your business!"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200">Company Logo</Label>
            <div className="flex items-center gap-4">
              {(logoPreview || receiptSettings.logo) && !settings.removeLogo && (
                <img 
                  src={logoPreview || receiptSettings.logo} 
                  alt="Logo Preview" 
                  className="w-20 h-20 object-contain rounded-md bg-white p-1" 
                />
              )}
              {settings.removeLogo && (
                <div className="w-20 h-20 flex items-center justify-center rounded-md bg-red-950/20 border border-red-800/50">
                  <span className="text-red-400 text-xs text-center">Logo will be removed</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button asChild variant="outline" className="border-amber-700 hover:bg-amber-900/50">
                  <label htmlFor="logo-upload" className="cursor-pointer flex items-center">
                    <ImageUp className="w-4 h-4 mr-2" />
                    {(logoPreview || receiptSettings.logo) ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </Button>
                {(logoPreview || receiptSettings.logo) && !settings.removeLogo && (
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleRemoveLogo}
                    className="border-red-700 hover:bg-red-900/50 text-red-200"
                  >
                    Remove Logo
                  </Button>
                )}
                {settings.removeLogo && (
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setSettings(prev => ({ ...prev, removeLogo: false }))}
                    className="border-green-700 hover:bg-green-900/50 text-green-200"
                  >
                    Keep Logo
                  </Button>
                )}
              </div>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptCustomization; 