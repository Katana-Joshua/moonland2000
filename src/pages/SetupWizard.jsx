import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrand } from '@/contexts/BrandContext';

const SetupWizard = () => {
  const { setBusinessType, businessTypes } = useBusiness();
  const { branding, LogoComponent } = useBrand();

  const handleSelectType = (typeId) => {
    setBusinessType(typeId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <Card className="glass-effect border-amber-800/50">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-24 h-auto flex items-center justify-center"
            >
              <LogoComponent className="w-20 h-20 text-amber-300" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-amber-100">
              Welcome to {branding.businessName}!
            </CardTitle>
            <CardDescription className="text-amber-200/80 text-lg">
              To get started, please select your primary business type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {businessTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => handleSelectType(type.id)}
                    className="w-full h-full p-6 rounded-lg bg-black/20 border border-amber-800/50 hover:bg-amber-900/30 hover:border-amber-700 transition-all duration-200 text-left flex flex-col items-center justify-center space-y-3"
                  >
                    <type.icon className="w-12 h-12 text-amber-400" />
                    <span className="text-lg font-semibold text-amber-100 text-center">{type.name}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SetupWizard;
