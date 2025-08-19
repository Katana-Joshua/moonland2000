import React from 'react';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext.jsx';
import SalesChart from '@/components/admin/SalesChart.jsx';
import LowStockAlerts from '@/components/admin/LowStockAlerts.jsx';
import QuickStats from './QuickStats';
import TopSellingItems from './TopSellingItems';
import RecentActivity from './RecentActivity';

const DashboardOverview = ({ setActiveTab }) => {
  const { sales, expenses, inventory } = usePOS();

  // Debug logging
  console.log('DashboardOverview rendered with:', { sales, expenses, inventory });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <QuickStats sales={sales} expenses={expenses} setActiveTab={setActiveTab} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <SalesChart sales={sales} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <TopSellingItems sales={sales} inventory={inventory} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <LowStockAlerts />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentActivity sales={sales} expenses={expenses} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
