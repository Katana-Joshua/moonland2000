import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/components/ui/use-toast';
import { Globe, Check } from 'lucide-react';

const CurrencySettings = () => {
  const { currency, setCurrency, availableCurrencies, isLoading } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency?.code || 'UGX');

  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency.code);
    }
  }, [currency]);

  const handleCurrencyChange = async (currencyCode) => {
    setSelectedCurrency(currencyCode);
    await setCurrency(currencyCode);
  };

  const currentCurrency = availableCurrencies.find(c => c.code === selectedCurrency);

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <Globe className="w-5 h-5 mr-2 text-amber-400" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">Current Currency</label>
            <div className="p-4 bg-black/20 rounded-lg border border-amber-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-amber-100">
                    {currentCurrency?.symbol} {currentCurrency?.name}
                  </p>
                  <p className="text-sm text-amber-200/70">Code: {currentCurrency?.code}</p>
                </div>
                <div className="flex items-center text-green-400">
                  <Check className="w-5 h-5 mr-1" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">Change Currency</label>
            <Select value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={isLoading}>
              <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{curr.symbol} {curr.name}</span>
                      <span className="text-amber-200/70 ml-2">({curr.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <h4 className="text-sm font-medium text-blue-200 mb-2">Currency Preview</h4>
            <div className="space-y-2 text-sm text-blue-100">
              <p>Sample Price: {currentCurrency?.symbol} 1,250.00</p>
              <p>Sample Total: {currentCurrency?.symbol} 15,750.50</p>
            </div>
          </div>

          <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-800/30">
            <h4 className="text-sm font-medium text-amber-200 mb-2">Important Notes</h4>
            <ul className="text-sm text-amber-100/80 space-y-1">
              <li>• Changing currency will affect all new transactions</li>
              <li>• Existing transaction amounts will remain unchanged</li>
              <li>• Receipts will display in the selected currency</li>
              <li>• Reports will show amounts in the selected currency</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencySettings;
