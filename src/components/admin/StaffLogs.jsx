import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const StaffLogs = () => {
  // Mock staff logs data
  const staffLogs = [
    {
      id: '1',
      cashierName: 'John Doe',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T17:00:00Z',
      startingCash: 200000,
      endingCash: 180000,
      totalSales: 1250050,
      shift: 'Morning'
    },
    {
      id: '2',
      cashierName: 'Jane Smith',
      startTime: '2024-01-15T17:00:00Z',
      endTime: '2024-01-16T01:00:00Z',
      startingCash: 180000,
      endingCash: 220000,
      totalSales: 1850750,
      shift: 'Evening'
    },
    {
      id: '3',
      cashierName: 'Mike Johnson',
      startTime: '2024-01-14T09:00:00Z',
      endTime: '2024-01-14T17:00:00Z',
      startingCash: 200000,
      endingCash: 195000,
      totalSales: 980250,
      shift: 'Morning'
    }
  ];

  const handleViewDetails = (log) => {
    toast({
      title: "Feature Coming Soon",
      description: "🚧 Detailed shift reports aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-100">Shift Logs</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staffLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border-amber-800/50 hover:border-amber-600/50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(log)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-amber-100">
                  <User className="w-5 h-5 mr-2" />
                  {log.cashierName}
                </CardTitle>
                <p className="text-sm text-amber-200/80">{log.shift} Shift</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-amber-400" />
                  <div>
                    <p className="text-amber-200/80">
                      {new Date(log.startTime).toLocaleDateString()} 
                    </p>
                    <p className="text-amber-200/60 text-xs">
                      {new Date(log.startTime).toLocaleTimeString()} - {new Date(log.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-amber-200/80">Starting Cash</p>
                    <p className="font-semibold text-amber-100">UGX {log.startingCash.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-amber-200/80">Ending Cash</p>
                    <p className="font-semibold text-amber-100">UGX {log.endingCash.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-800/30">
                  <span className="text-amber-200/80 text-sm">Total Sales</span>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                    <span className="font-bold text-green-400">UGX {log.totalSales.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-amber-200/60">
                  Cash Difference: UGX {(log.endingCash - log.startingCash).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {staffLogs.length === 0 && (
        <Card className="glass-effect border-amber-800/50">
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-amber-400/50 mb-4" />
            <p className="text-amber-200/60">No shift logs available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffLogs;