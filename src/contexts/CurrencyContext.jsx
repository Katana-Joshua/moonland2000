import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { brandingAPI } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const availableCurrencies = [
  { code: 'UGX', symbol: 'UGX', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'RWF', symbol: 'RF', name: 'Rwandan Franc' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'CFA', name: 'Central African CFA Franc' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(availableCurrencies[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from database on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/currency/current`);
        if (response.ok) {
          const data = await response.json();
          if (data.currency_code) {
            const foundCurrency = availableCurrencies.find(c => c.code === data.currency_code);
            if (foundCurrency) {
              setCurrency(foundCurrency);
            }
          }
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  const updateCurrency = async (currencyCode) => {
    const newCurrency = availableCurrencies.find(c => c.code === currencyCode);
    if (!newCurrency) {
      toast({
        title: 'Invalid Currency',
        description: 'The selected currency is not supported.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/currency/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency_code: newCurrency.code,
          currency_symbol: newCurrency.symbol,
          currency_name: newCurrency.name,
        }),
      });

      if (response.ok) {
        setCurrency(newCurrency);
        toast({
          title: 'Currency Updated',
          description: `The system will now use ${newCurrency.name} (${newCurrency.code}).`,
        });
      } else {
        throw new Error('Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update currency. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = useMemo(() => (amount) => {
    if (typeof amount !== 'number') {
      return `${currency.symbol} 0.00`;
    }
    return `${currency.symbol} ${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, [currency]);

  const value = useMemo(() => ({
    currency,
    setCurrency: updateCurrency,
    availableCurrencies,
    formatCurrency,
    isLoading,
  }), [currency, formatCurrency, isLoading]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
