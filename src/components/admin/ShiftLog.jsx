import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { posAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { History, Loader2, ServerCrash } from 'lucide-react';

const ShiftLog = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        const shifts = await posAPI.getShifts();
        setShifts(shifts);
      } catch (error) {
        setError(error.message);
        toast({
          title: 'Error fetching shifts',
          description: error.message,
          variant: 'destructive',
        });
      }
      setLoading(false);
    };

    fetchShifts();
  }, []);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return `UGX ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-400">
        <ServerCrash className="h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">Failed to load shift data</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <History className="w-6 h-6 mr-3" />
            Shift Log History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-800/50 hover:bg-black/10">
                  <TableHead className="text-amber-200">Cashier</TableHead>
                  <TableHead className="text-amber-200">Start Time</TableHead>
                  <TableHead className="text-amber-200">End Time</TableHead>
                  <TableHead className="text-amber-200 text-right">Starting Cash</TableHead>
                  <TableHead className="text-amber-200 text-right">Ending Cash</TableHead>
                  <TableHead className="text-amber-200">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length > 0 ? (
                  shifts.map((shift) => (
                    <TableRow key={shift.id} className="border-amber-800/50 hover:bg-black/20">
                      <TableCell className="font-medium text-amber-100">{shift.staff?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-amber-300">{formatDate(shift.start_time)}</TableCell>
                      <TableCell className="text-amber-300">{formatDate(shift.end_time)}</TableCell>
                      <TableCell className="text-right text-amber-300">{formatCurrency(shift.starting_cash)}</TableCell>
                      <TableCell className="text-right text-amber-300">{formatCurrency(shift.ending_cash)}</TableCell>
                      <TableCell>
                        <Badge variant={shift.status === 'completed' ? 'success' : 'destructive'}>
                          {shift.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="h-24 text-center text-amber-200/80">
                      No shift records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ShiftLog;