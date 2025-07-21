
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookUser, History, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CreditSalesManagement = () => {
  const { sales, payCreditSale } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const customerDebts = useMemo(() => {
    const customers = {};
    sales
      .filter(sale => sale.paymentMethod === 'credit')
      .forEach(sale => {
        const customerName = sale.customerInfo?.name || 'Unknown Customer';
        if (!customers[customerName]) {
          customers[customerName] = {
            name: customerName,
            totalDebt: 0,
            paidAmount: 0,
            unpaidAmount: 0,
            lastSaleDate: new Date(0),
          };
        }
        if (sale.status === 'unpaid') {
          customers[customerName].unpaidAmount += sale.total;
        } else {
          customers[customerName].paidAmount += sale.total;
        }
        customers[customerName].totalDebt += sale.total;
        if (new Date(sale.timestamp) > customers[customerName].lastSaleDate) {
          customers[customerName].lastSaleDate = new Date(sale.timestamp);
        }
      });
    return Object.values(customers).sort((a, b) => b.unpaidAmount - a.unpaidAmount);
  }, [sales]);

  const filteredCustomers = customerDebts.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePay = (saleId) => {
    payCreditSale(saleId);
  };
  
  const viewHistory = (customerName) => {
    navigate(`/admin/customer-debts/${encodeURIComponent(customerName)}`);
  };

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center">
            <BookUser className="w-6 h-6 mr-3 text-amber-400" />
            <CardTitle className="text-amber-100">Customer Debts</CardTitle>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
            <Input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-amber-800/50 text-amber-100"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead className="text-right">Outstanding Debt</TableHead>
                <TableHead className="text-right">Total Debt (All Time)</TableHead>
                <TableHead className="hidden sm:table-cell">Last Transaction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-amber-800/30"
                  >
                    <TableCell className="font-semibold">{customer.name}</TableCell>
                    <TableCell className="text-right font-bold text-red-400">
                      UGX {customer.unpaidAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      UGX {customer.totalDebt.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {customer.lastSaleDate ? new Date(customer.lastSaleDate).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewHistory(customer.name)}
                        className="border-amber-700 hover:bg-amber-900/50"
                      >
                        <History className="w-4 h-4 mr-2" />
                        History
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-amber-200/60 h-24">
                    No matching customer debts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditSalesManagement;
