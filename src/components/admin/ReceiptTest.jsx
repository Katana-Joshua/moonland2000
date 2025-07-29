import React from 'react';
import { usePOS } from '@/contexts/POSContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt } from '@/components/common/Receipt';
import { useRef } from 'react';

const ReceiptTest = () => {
  const { receiptSettings } = usePOS();
  const receiptRef = useRef();

  const testSale = {
    id: 'test-123',
    receiptNumber: 'RCP-123456',
    timestamp: new Date().toISOString(),
    cashierName: 'Test Cashier',
    paymentMethod: 'cash',
    customerInfo: { name: 'Test Customer', contact: '+1234567890' },
    cashReceived: 1000,
    changeGiven: 50,
    items: [
      { id: '1', name: 'Test Item 1', price: 500, quantity: 1 },
      { id: '2', name: 'Test Item 2', price: 450, quantity: 1 }
    ],
    total: 950,
    totalCost: 400,
    profit: 550
  };

  const handlePrintTest = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Test Receipt</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .receipt-container { max-width: 80mm; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${receiptRef.current.outerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100">Current Receipt Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-amber-200">Company Name:</strong>
              <p className="text-amber-100">{receiptSettings.companyName || 'Not set'}</p>
            </div>
            <div>
              <strong className="text-amber-200">Address:</strong>
              <p className="text-amber-100">{receiptSettings.address || 'Not set'}</p>
            </div>
            <div>
              <strong className="text-amber-200">Phone:</strong>
              <p className="text-amber-100">{receiptSettings.phone || 'Not set'}</p>
            </div>
            <div>
              <strong className="text-amber-200">Footer:</strong>
              <p className="text-amber-100">{receiptSettings.footer || 'Not set'}</p>
            </div>
            <div>
              <strong className="text-amber-200">Logo:</strong>
              <p className="text-amber-100">{receiptSettings.logo ? 'Uploaded' : 'Not uploaded'}</p>
              {receiptSettings.logo && (
                <div className="mt-2">
                  <img 
                    src={receiptSettings.logo} 
                    alt="Logo Preview" 
                    className="w-16 h-16 object-contain bg-white rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100">Receipt Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg">
            <Receipt ref={receiptRef} sale={testSale} />
          </div>
          <div className="mt-4">
            <Button onClick={handlePrintTest} className="w-full">
              Print Test Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptTest; 