import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { toast } from '@/components/ui/use-toast';
import { User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const { branding, LogoComponent } = useBrand();
  const { businessType } = useBusiness();
  const navigate = useNavigate();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'cashier') {
        navigate('/cashier');
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); 

    try {
      const result = await login(username, password); 
      if (result.success && result.user) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else if (result.user.role === 'cashier') {
          navigate('/cashier');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-amber-800/50">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-40 h-auto flex items-center justify-center"
            >
              <LogoComponent className="w-24 h-24 text-amber-300" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-amber-100">
              {branding.businessName}
            </CardTitle>
            <p className="text-amber-200/80">
              {branding.slogan}
            </p>
            {businessType && (
              <div className="pt-2">
                <span className="inline-block bg-amber-900/50 text-amber-300 text-sm font-medium px-3 py-1 rounded-full">
                  {businessType.name}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-100">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-black/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-100">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;