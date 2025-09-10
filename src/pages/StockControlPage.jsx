import React from 'react';
import { useNavigate } from 'react-router-dom';
import StockMovementReport from '@/components/admin/stock/StockMovementReport';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StockControlPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <ClipboardCheck className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-amber-100">Stock Control Center</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin', { state: { selectedTab: 'dashboard' } })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
      <p className="text-amber-200/80 max-w-2xl">
        Audit your inventory movements with precision. Select an item and a date range to see a detailed stock ledger, including sales, purchases, and returns. Use the physical count feature to identify variances and maintain accurate stock levels.
      </p>
      <StockMovementReport />
    </div>
  );
};

export default StockControlPage;
