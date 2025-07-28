import React, { useState } from 'react';
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
  const [settings, setSettings] = useState(receiptSettings);
  const [logoPreview, setLogoPreview] = useState(receiptSettings.logo);

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
        setLogoPreview(reader.result);
        setSettings(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateReceiptSettings(settings);
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
              value={settings.companyName}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-amber-200">Address</Label>
            <Input
              id="address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-amber-200">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footer" className="text-amber-200">Receipt Footer Message</Label>
            <Textarea
              id="footer"
              name="footer"
              value={settings.footer}
              onChange={handleInputChange}
              className="bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200">Company Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview && <img src={logoPreview} alt="Logo Preview" className="w-20 h-20 object-contain rounded-md bg-white p-1" />}
              <Button asChild variant="outline" className="border-amber-700 hover:bg-amber-900/50">
                <label htmlFor="logo-upload" className="cursor-pointer flex items-center">
                  <ImageUp className="w-4 h-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </label>
              </Button>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>
          <Button type="submit" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptCustomization; 