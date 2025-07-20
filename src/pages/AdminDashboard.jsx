
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Users,
  Package,
  AlertTriangle,
  FileText,
  CreditCard,
  TrendingDown,
  BookOpen,
  History,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import InventoryManagement from '@/components/admin/InventoryManagement';
import StaffManagement from '@/components/admin/StaffManagement';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import SalesReports from '@/components/admin/SalesReports';
import CreditSalesManagement from '@/components/admin/CreditSalesManagement';
import ExpenseTracking from '@/components/admin/ExpenseTracking';
import AccountingDashboard from '@/components/admin/accounting/AccountingDashboard';
import ShiftLog from '@/components/admin/ShiftLog';
import TransactionHistory from '@/components/admin/TransactionHistory';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { isLoading } = usePOS();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <Loading message="Loading admin data..." />;
  }

  const tabs = [
    { value: 'reports', label: 'Sales Reports', icon: BarChart },
    { value: 'transactions', label: 'Transactions', icon: FileText },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'staff', label: 'Staff', icon: Users },
    { value: 'shifts', label: 'Shift Log', icon: History },
    { value: 'credit', label: 'Customer Debts', icon: CreditCard },
    { value: 'expenses', label: 'Expenses', icon: TrendingDown },
    { value: 'accounting', label: 'Accounting', icon: BookOpen },
    { value: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-amber-100 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-amber-200/80 mt-1">
              Manage your business operations from one central hub.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-amber-800/50 text-amber-100 hover:bg-amber-950/50 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <Tabs defaultValue="reports" className="w-full">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="bg-transparent p-0 space-x-2 sm:grid sm:w-full sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 sm:gap-2 sm:space-x-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-amber-600/80 data-[state=active]:text-white text-amber-200 bg-black/20 border border-amber-800/50 hover:bg-amber-900/40 transition-all flex-shrink-0"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="reports">
              <SalesReports />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>
            <TabsContent value="inventory">
              <InventoryManagement />
            </TabsContent>
            <TabsContent value="staff">
              <StaffManagement />
            </TabsContent>
            <TabsContent value="shifts">
              <ShiftLog />
            </TabsContent>
            <TabsContent value="credit">
              <CreditSalesManagement />
            </TabsContent>
            <TabsContent value="expenses">
              <ExpenseTracking />
            </TabsContent>
            <TabsContent value="accounting">
              <AccountingDashboard />
            </TabsContent>
            <TabsContent value="low-stock">
              <LowStockAlerts />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
