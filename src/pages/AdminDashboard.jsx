
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  LayoutDashboard,
  Box,
  Users,
  History,
  FileText,
  LogOut,
  BookUser,
  DollarSign,
  Settings,
  BarChart3,
  Menu,
  X,
  Replace
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import InventoryManagement from '@/components/admin/InventoryManagement';
import StaffManagement from '@/components/admin/StaffManagement';
import TransactionHistory from '@/components/admin/TransactionHistory';
import SalesReports from '@/components/admin/SalesReports';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import CreditSalesManagement from '@/components/admin/CreditSalesManagement';
import ExpenseTracking from '@/components/admin/ExpenseTracking';
import AccountingDashboard from '@/components/admin/accounting/AccountingDashboard';
import ShiftLog from '@/components/admin/ShiftLog';
import ReceiptCustomization from '@/components/admin/ReceiptCustomization';
import SalesChart from '@/components/admin/SalesChart';
import DashboardOverview from '@/components/admin/dashboard/DashboardOverview';
import AdminTerminal from '@/components/admin/AdminTerminal';
import BrandingSettings from '@/components/admin/BrandingSettings';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { isLoading, sales } = usePOS();
  const { businessType, clearAllBusinessData } = useBusiness();
  const location = useLocation();
  const initialTab = location.state?.selectedTab || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleConfirmReset = () => {
    clearAllBusinessData();
    logout();
  };

  if (isLoading) {
    return <Loading message="Loading admin data..." />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Sales Reports', icon: FileText },
    { id: 'inventory', label: businessType?.features?.inventoryLabel || 'Inventory', icon: Box },
    { id: 'accounting', label: 'Accounting', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'credit', label: 'Customer Debts', icon: BookUser },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'shifts', label: 'Shift Log', icon: History },
    { id: 'low-stock', label: 'Low Stock', icon: Box },
    { id: 'settings', label: 'Receipt Settings', icon: Settings },
    { id: 'terminal', label: 'Manual Entry', icon: Menu },
    { id: 'branding', label: 'Branding', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'transactions':
        return <TransactionHistory />;
      case 'reports':
        return <SalesReports />;
      case 'credit':
        return <CreditSalesManagement />;
      case 'expenses':
        return <ExpenseTracking />;
      case 'shifts':
        return <ShiftLog />;
      case 'accounting':
        return <AccountingDashboard />;
      case 'low-stock':
        return <LowStockAlerts />;
      case 'settings':
        return <ReceiptCustomization />;
      case 'terminal':
        return <AdminTerminal />;
      case 'branding':
        return <BrandingSettings />;
      case 'dashboard':
      default:
        return <DashboardOverview setActiveTab={handleTabClick} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Moon Land POS</title>
      </Helmet>
      <div className="flex h-screen bg-transparent">
        {/* Sidebar */}
        <aside className={`absolute md:relative z-20 w-64 p-4 space-y-2 bg-black/50 backdrop-blur-lg text-amber-100 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-400">Admin Panel</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-amber-200 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Logout button positioned at top for easy access */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-red-900/50 text-red-300 mb-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
          
          {/* Switch Business button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center p-3 rounded-lg transition-all duration-200 text-amber-300 hover:bg-amber-950/30 mb-4">
                <Replace className="w-5 h-5 mr-3" />
                <span>Switch Business</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-effect border-amber-800/50 text-amber-100 bg-gray-900/80">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-amber-200/80">
                  Switching business type will permanently erase all existing data for the current business, including sales, inventory, staff records, and expenses. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent hover:bg-amber-950/30 border-amber-800/50 text-amber-100">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmReset} className="bg-red-600 hover:bg-red-700 text-white">
                  Yes, erase data and switch
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <nav className="flex-grow">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-l-4 border-amber-400 bg-amber-900/10 text-amber-300'
                    : 'hover:bg-amber-950/30 border-l-4 border-transparent'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden p-4 bg-black/20 flex justify-between items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-amber-200 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-amber-100">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="w-6"></div>
          </header>

          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-10"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
