
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
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
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

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { isLoading, sales } = usePOS();
  const location = useLocation();
  const initialTab = location.state?.selectedTab || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return <Loading message="Loading admin data..." />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Sales Reports', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'accounting', label: 'Accounting', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'credit', label: 'Customer Debts', icon: BookUser },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'shifts', label: 'Shift Log', icon: History },
    { id: 'low-stock', label: 'Low Stock', icon: Box },
    { id: 'settings', label: 'Settings', icon: Settings },
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
      case 'dashboard':
      default:
        return <DashboardOverview handleTabClick={handleTabClick} />;
    }
  };

  const DashboardOverview = ({ handleTabClick }) => {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SalesChart sales={sales} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <LowStockAlerts />
        </motion.div>
      </div>
    );
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
          <nav className="flex-grow mt-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-900/50 text-amber-300'
                    : 'hover:bg-amber-950/30'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-red-900/50 text-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
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
