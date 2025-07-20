import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Card className="bg-amber-950/20 border-amber-800/30">
      <CardHeader>
        <CardTitle className="text-amber-100">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-amber-200">
            <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </p>
          <p className="text-amber-200">
            <strong>User:</strong> {user ? user.username : 'None'}
          </p>
          <p className="text-amber-200">
            <strong>Role:</strong> {user ? user.role : 'None'}
          </p>
        </div>
        
        {isAuthenticated && (
          <Button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthTest; 