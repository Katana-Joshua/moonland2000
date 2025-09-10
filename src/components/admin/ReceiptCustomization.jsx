import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Settings, Printer, Eye } from 'lucide-react';

const ReceiptCustomization = () => {
  const [template, setTemplate] = useState({
    template_name: 'Default Template',
    header_text: 'Thank you for your business!',
    footer_text: 'Please come again!',
    show_logo: true,
    show_business_info: true,
    show_tax_info: true,
    show_cashier_info: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/receipt-templates/default`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/receipt-templates/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        toast({
          title: 'Template Updated',
          description: 'Receipt template has been saved successfully.',
        });
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update receipt template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=400,height=600');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Receipt Preview</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 20px; }
            .business-info { text-align: center; margin-bottom: 10px; }
            .items { margin: 10px 0; }
            .total { font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${template.show_logo ? '<div class="header">[LOGO]</div>' : ''}
          ${template.show_business_info ? '<div class="business-info">Business Name<br>Address<br>Phone</div>' : ''}
          <div class="header">${template.header_text}</div>
          <div class="items">
            Item 1 x 2 = 100.00<br>
            Item 2 x 1 = 50.00<br>
          </div>
          <div class="total">Total: 150.00</div>
          ${template.show_cashier_info ? '<div>Cashier: John Doe</div>' : ''}
          ${template.show_tax_info ? '<div>Tax: 0.00</div>' : ''}
          <div class="footer">${template.footer_text}</div>
        </body>
      </html>
    `);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Settings className="w-5 h-5 mr-2 text-amber-400" />
            Receipt Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template_name" className="text-amber-200">Template Name</Label>
                <Input
                  id="template_name"
                  value={template.template_name}
                  onChange={(e) => setTemplate({ ...template, template_name: e.target.value })}
                  className="bg-black/20 border-amber-800/50 text-amber-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header_text" className="text-amber-200">Header Text</Label>
                <Textarea
                  id="header_text"
                  value={template.header_text}
                  onChange={(e) => setTemplate({ ...template, header_text: e.target.value })}
                  className="bg-black/20 border-amber-800/50 text-amber-100"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_text" className="text-amber-200">Footer Text</Label>
                <Textarea
                  id="footer_text"
                  value={template.footer_text}
                  onChange={(e) => setTemplate({ ...template, footer_text: e.target.value })}
                  className="bg-black/20 border-amber-800/50 text-amber-100"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-amber-200">Display Options</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show_logo"
                    checked={template.show_logo}
                    onCheckedChange={(checked) => setTemplate({ ...template, show_logo: checked })}
                  />
                  <Label htmlFor="show_logo" className="text-amber-100">Show Logo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show_business_info"
                    checked={template.show_business_info}
                    onCheckedChange={(checked) => setTemplate({ ...template, show_business_info: checked })}
                  />
                  <Label htmlFor="show_business_info" className="text-amber-100">Show Business Information</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show_tax_info"
                    checked={template.show_tax_info}
                    onCheckedChange={(checked) => setTemplate({ ...template, show_tax_info: checked })}
                  />
                  <Label htmlFor="show_tax_info" className="text-amber-100">Show Tax Information</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show_cashier_info"
                    checked={template.show_cashier_info}
                    onCheckedChange={(checked) => setTemplate({ ...template, show_cashier_info: checked })}
                  />
                  <Label htmlFor="show_cashier_info" className="text-amber-100">Show Cashier Information</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              <Settings className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Template'}
            </Button>
            <Button onClick={handlePreview} variant="outline" className="border-amber-800/50 text-amber-100">
              <Eye className="w-4 h-4 mr-2" />
              Preview Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptCustomization;