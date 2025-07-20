
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import CashierDashboard from '@/pages/CashierDashboard.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { POSProvider } from '@/contexts/POSContext.jsx';
import { AccountingProvider } from '@/contexts/AccountingContext.jsx';
import CustomerDebtHistory from '@/pages/CustomerDebtHistory.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <POSProvider>
        <Router>
          <Helmet>
            <title>Moon Land - Point of Sale System</title>
            <meta name="description" content="Modern point of sale system for bars and restaurants, featuring admin and cashier dashboards, inventory management, and sales reporting." />
          </Helmet>
          <div className="min-h-screen bar-gradient">
            <Routes>
              <Route path="/" element={<LoginPage />} />
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
        </Router>
      </POSProvider>
    </AuthProvider>
  );
}

export default App;
