
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [showDangerousSwitchDialog, setShowDangerousSwitchDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmationValid, setIsConfirmationValid] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleConfirmReset = async () => {
    try {
      await clearAllBusinessData();
      // Close the dangerous switch dialog
      setShowDangerousSwitchDialog(false);
      // Navigate to setup to select new business type
      navigate('/setup');
    } catch (error) {
      console.error('Error during business reset:', error);
      // Keep dialog open if there's an error
    }
  };

  const handleSwitchBusinessOpen = () => {
    // Clear the confirmation input when dialog opens
    setTimeout(() => {
      const input = document.getElementById('confirmation-text');
      const confirmBtn = document.getElementById('confirm-delete-btn');
      if (input) input.value = '';
      if (confirmBtn) confirmBtn.disabled = true;
    }, 100);
  };

  const handleSafeSwitch = () => {
    // Open business type selection for safe switch
    navigate('/setup');
  };

  const handleDangerousSwitch = () => {
    // Open the dangerous switch confirmation dialog
    setShowDangerousSwitchDialog(true);
  };

  const handleCloseDangerousDialog = () => {
    setShowDangerousSwitchDialog(false);
    // Clear the confirmation text and reset validation
    setConfirmationText('');
    setIsConfirmationValid(false);
  };

  const handleConfirmationChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsConfirmationValid(text === 'I want to delete all this content before switching to new business');
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
          
          {/* Current Business Type Indicator */}
          {businessType && (
            <div className="mt-2 p-2 bg-amber-900/20 border border-amber-800/50 rounded-lg">
              <div className="text-xs text-amber-400/60 uppercase tracking-wide">Current Business</div>
              <div className="text-sm font-medium text-amber-200">{businessType.name}</div>
            </div>
          )}
          
          {/* Logout button positioned at top for easy access */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-red-900/50 text-red-300 mb-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
          
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

          {/* Switch Business button - moved below navigation */}
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center p-3 rounded-lg transition-all duration-200 text-amber-300 hover:bg-amber-950/30">
                  <Replace className="w-5 h-5 mr-3" />
                  <span>Switch Business</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-effect border-amber-800/50 text-amber-100 bg-gray-900/80 max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>🔄 Switch Business Type</AlertDialogTitle>
                  <AlertDialogDescription className="text-amber-200/80">
                    Choose how you want to switch your business type:
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4 space-y-4">
                  {/* Safe Switch Option */}
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="text-green-200 font-semibold">Safe Switch (Recommended)</h4>
                        <p className="text-green-300/80 text-sm">Keep all your data and just change business type</p>
                      </div>
                    </div>
                    <div className="text-xs text-green-300/60 ml-11">
                      • All sales, inventory, staff, and expenses remain
                      • Only business type and labels change
                      • Perfect for rebranding or business evolution
                    </div>
                    <button
                      onClick={handleSafeSwitch}
                      className="mt-3 ml-11 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Safe Switch
                    </button>
                  </div>

                  {/* Dangerous Switch Option */}
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">⚠</span>
                      </div>
                      <div>
                        <h4 className="text-red-200 font-semibold">Dangerous Switch</h4>
                        <p className="text-red-300/80 text-sm">Delete all data and start fresh</p>
                      </div>
                    </div>
                    <div className="text-xs text-red-300/60 ml-11">
                      • Permanently deletes ALL business data
                      • Sales, inventory, staff, expenses will be lost
                      • Only use if you want a completely fresh start
                    </div>
                    <button
                      onClick={handleDangerousSwitch}
                      className="mt-3 ml-11 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Dangerous Switch
                    </button>
                  </div>
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent hover:bg-amber-950/30 border-amber-800/50 text-amber-100">
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Dangerous Switch Confirmation Dialog */}
          <AlertDialog open={showDangerousSwitchDialog} onOpenChange={handleCloseDangerousDialog}>
            <AlertDialogContent className="glass-effect border-red-800/50 text-red-100 bg-gray-900/80 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ DANGEROUS ACTION</AlertDialogTitle>
                <AlertDialogDescription className="text-red-200/80">
                  Switching business type will <strong>PERMANENTLY DELETE</strong> all existing data including:
                  <br />• Sales records
                  <br />• Inventory items
                  <br />• Staff records
                  <br />• Expenses
                  <br />• Categories
                  <br /><br />
                  <strong>This action cannot be undone!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4">
                <div className="text-sm text-red-200/80 mb-3">
                  To confirm deletion, type exactly:
                  <br /><code className="bg-red-900/50 px-2 py-1 rounded text-red-200 font-mono">I want to delete all this content before switching to new business</code>
                </div>
                <input
                  type="text"
                  id="confirmation-text"
                  value={confirmationText}
                  placeholder="Type the confirmation phrase..."
                  className={`w-full p-2 bg-black/30 border rounded transition-colors ${
                    isConfirmationValid 
                      ? 'border-green-500 text-green-100' 
                      : 'border-red-800/50 text-red-100'
                  }`}
                  onChange={handleConfirmationChange}
                />
                {isConfirmationValid && (
                  <div className="mt-2 text-green-400 text-sm flex items-center">
                    <span className="mr-2">✓</span>
                    Confirmation text matches! Button is now enabled.
                  </div>
                )}
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel 
                  className="bg-transparent hover:bg-red-950/30 border-red-800/50 text-red-100"
                  onClick={handleCloseDangerousDialog}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  id="confirm-delete-btn"
                  onClick={handleConfirmReset} 
                  className={`font-medium transition-all duration-200 ${
                    isConfirmationValid
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isConfirmationValid}
                >
                  Yes, erase data and switch
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
