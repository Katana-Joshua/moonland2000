
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import CashierDashboard from '@/pages/CashierDashboard.jsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import { POSProvider } from '@/contexts/POSContext.jsx';
import { AccountingProvider } from '@/contexts/AccountingContext.jsx';
import { BrandProvider } from '@/contexts/BrandContext.jsx';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext.jsx';
import CustomerDebtHistory from '@/pages/CustomerDebtHistory.jsx';
import SetupWizard from '@/pages/SetupWizard.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';

// Component to guard routes based on business type
const BusinessTypeGuard = ({ children }) => {
  const { businessType, isLoading } = useBusiness();
  const location = useLocation();

  // If still loading, show loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-amber-300">Loading business configuration...</div>
    </div>;
  }

  // If no business type is set, force user to setup screen, unless they are already there
  if (!businessType && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If business type IS set, but user tries to go to setup, redirect them to login page
  if (businessType && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <Router>
          <BrandProvider>
            <BusinessProvider>
              <BusinessTypeGuard>
                <Helmet>
                  <title>Moon Land - Point of Sale System</title>
                  <meta name="description" content="Modern point of sale system for bars and restaurants, featuring admin and cashier dashboards, inventory management, and sales reporting." />
                </Helmet>
                <div className="min-h-screen bar-gradient">
                  <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/setup" element={<SetupWizard />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AccountingProvider>
                            <AdminDashboard />
                          </AccountingProvider>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cashier" 
                      element={
                        <ProtectedRoute requiredRole="cashier">
                          <CashierDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/customer-debts/:customerName" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AccountingProvider>
                            <CustomerDebtHistory />
                          </AccountingProvider>
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                  <Toaster />
                </div>
              </BusinessTypeGuard>
            </BusinessProvider>
          </BrandProvider>
        </Router>
      </POSProvider>
    </AuthProvider>
  );
}

export default App;
