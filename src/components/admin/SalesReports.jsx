import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Download, TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, LayoutGrid } from 'lucide-react';
import SalesReportFilter from '@/components/admin/reports/SalesReportFilter';
import { generatePDF } from '@/components/admin/reports/pdfGenerator';
import { generateExcel } from '@/components/admin/reports/excelGenerator';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SalesReports = () => {
  const { sales, expenses, categories, inventory } = usePOS();
  const [filteredSales, setFilteredSales] = useState(sales);
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);

  useEffect(() => {
    setFilteredSales(sales);
    setFilteredExpenses(expenses);
  }, [sales, expenses]);

  const handleFilter = ({ sales, expenses }) => {
    setFilteredSales(sales);
    setFilteredExpenses(expenses);
  };

  const departmentBreakdown = useMemo(() => {
    const breakdown = {};
    const categoryNames = categories.map(c => c.name);

    categoryNames.forEach(cat => {
      breakdown[cat] = {
        sales: 0,
        profit: 0,
        itemsSold: 0,
      };
    });

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const inventoryItem = inventory.find(invItem => invItem.id === item.id);
        const category = inventoryItem?.category || 'Uncategorized';
        
        if (!breakdown[category]) {
           breakdown[category] = { sales: 0, profit: 0, itemsSold: 0 };
        }

        const itemTotal = item.price * item.quantity;
        const itemCost = (item.costPrice || 0) * item.quantity;

        breakdown[category].sales += itemTotal;
        breakdown[category].profit += itemTotal - itemCost;
        breakdown[category].itemsSold += item.quantity;
      });
    });

    return Object.entries(breakdown)
        .filter(([, data]) => data.sales > 0)
        .sort(([, a], [, b]) => b.sales - a.sales);

  }, [filteredSales, categories, inventory]);

  const handleExport = (exportType) => {
    if (filteredSales.length === 0 && filteredExpenses.length === 0) {
      toast({
        title: 'No Data',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    const exportData = {
      sales: filteredSales,
      expenses: filteredExpenses,
      departmentBreakdown,
    };

    if (exportType === 'pdf') {
      generatePDF(exportData);
      toast({
        title: 'PDF Generated',
        description: 'Financial report has been downloaded',
      });
    } else if (exportType === 'excel') {
      generateExcel(exportData);
      toast({
        title: 'Excel File Generated',
        description: 'Financial report has been downloaded as .xlsx',
      });
    }
  };

  const totalRevenue = (filteredSales || []).reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalProfit = (filteredSales || []).reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalExpenses = (filteredExpenses || []).reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalProfit - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-effect border-amber-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200/80">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-amber-100">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-red-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-200/80">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-200/80">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <SalesReportFilter onFilter={handleFilter} />

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => handleExport('pdf')} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF Report
        </Button>
        <Button onClick={() => handleExport('excel')} className="bg-blue-600 hover:bg-blue-700">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Excel Report
        </Button>
      </div>

      {/* Department Breakdown */}
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100 flex items-center">
            <LayoutGrid className="w-5 h-5 mr-2" />
            Department Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {departmentBreakdown.map(([category, data], index) => (
              <AccordionItem key={category} value={`item-${index}`}>
                <AccordionTrigger className="text-amber-100 hover:text-amber-200">
                  <div className="flex justify-between items-center w-full pr-4">
                    <span className="font-semibold">{category}</span>
                    <span className="text-amber-300">{formatCurrency(data.sales)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-amber-200/80">
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-amber-200/60">Revenue</p>
                      <p className="font-semibold text-amber-100">{formatCurrency(data.sales)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-200/60">Profit</p>
                      <p className="font-semibold text-green-400">{formatCurrency(data.profit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-200/60">Items Sold</p>
                      <p className="font-semibold text-amber-100">{data.itemsSold}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100">
            Filtered Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-amber-100 text-lg">Sales ({(filteredSales || []).length})</h3>
            {(filteredSales || []).length === 0 ? (
              <p className="text-amber-200/60 text-center py-4">No sales records found for this period.</p>
            ) : (
              (filteredSales || []).map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-amber-800/30"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-amber-100">Receipt #{sale.receiptNumber || 'N/A'}</p>
                      <p className="text-sm text-amber-200/80">
                        {new Date(sale.timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'Africa/Kampala' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-100">{formatCurrency(sale.total)}</p>
                      <p className="text-sm text-green-400">Profit: {formatCurrency(sale.profit)}</p>
                    </div>
                  </div>
                   <div className="text-sm text-amber-200/70 border-t border-amber-800/30 pt-2 mt-2">
                     {(sale.items || []).map((item, idx) => (
                       <span key={idx} className="mr-2">
                         {item.name} x{item.quantity}
                       </span>
                     ))}
                   </div>
                </motion.div>
              ))
            )}
            <h3 className="font-semibold text-red-100 text-lg mt-6">Expenses ({(filteredExpenses || []).length})</h3>
            {(filteredExpenses || []).length === 0 ? (
              <p className="text-amber-200/60 text-center py-4">No expense records found for this period.</p>
            ) : (
              (filteredExpenses || []).map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-red-800/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-100">{expense.description || 'N/A'}</p>
                      <p className="text-sm text-red-200/80">
                        {new Date(expense.timestamp || Date.now()).toLocaleString()} by {expense.cashier || 'Unknown'}
                      </p>
                    </div>
                    <p className="font-bold text-red-200">- UGX {(expense.amount || 0).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;