import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!authAPI.isAuthenticated();

  // Handle token expiration
  useEffect(() => {
    const handleTokenExpiration = (event) => {
      console.log('🔄 Token expiration detected in AuthContext');
      setUser(null);
      toast({
        title: "Session Expired",
        description: event.detail?.message || "Your session has expired. Please log in again.",
        variant: "destructive"
      });
    };

    // Listen for token expiration events
    window.addEventListener('tokenExpired', handleTokenExpiration);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiration);
    };
  }, []);

  // Periodic token validation and refresh
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const validateAndRefreshToken = async () => {
      try {
        // Only check token validity, don't automatically refresh
        const isValid = await authAPI.checkTokenValidity();
        if (!isValid) {
          console.log('🔄 Token invalid, attempting silent refresh...');
          await authAPI.refreshToken();
          // Removed toast notification to avoid annoying the user
        }
      } catch (error) {
        console.error('Token validation/refresh error:', error);
        // Don't automatically logout on validation errors, only on actual token expiration
      }
    };

    // Check token validity every 15 minutes instead of 5 minutes
    const interval = setInterval(validateAndRefreshToken, 15 * 60 * 1000);

    // Only check when page becomes visible, not on every visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Add a small delay to avoid immediate check on page focus
        setTimeout(validateAndRefreshToken, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser && authAPI.isAuthenticated()) {
          setUser(currentUser);
        } else {
          // Clear any stale data
          setUser(null);
          authAPI.logout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.success) {
        setUser(response.data.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.username}!`,
        });
        return { success: true, user: response.data.user };
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive"
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};