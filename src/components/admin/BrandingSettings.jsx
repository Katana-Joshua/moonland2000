import React, { useState } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ImageDown as ImageUp, Save, Building } from 'lucide-react';

const BrandingSettings = () => {
  const { branding, updateBranding, LogoComponent } = useBrand();
  const [settings, setSettings] = useState(branding);
  const [logoPreview, setLogoPreview] = useState(branding.logo);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setLogoPreview(result);
        setSettings(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBranding(settings);
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-amber-200">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={settings.businessName}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan" className="text-amber-200">Slogan (for Login Screen)</Label>
            <Input
              id="slogan"
              name="slogan"
              value={settings.slogan}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
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
          <Button type="submit" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Branding
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;
