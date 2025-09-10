import React from 'react';
import { motion } from 'framer-motion';
import { usePOS } from '@/contexts/POSContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, Calendar, MessageSquare, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const ClientReviewsPage = () => {
  const { sales } = usePOS();
  const navigate = useNavigate();

  const clients = sales.reduce((acc, sale) => {
    if (sale.customerName || sale.customerContact) {
      const clientKey = `${sale.customerName || ''}-${sale.customerContact || ''}`.toLowerCase();
      if (!acc[clientKey]) {
        acc[clientKey] = {
          name: sale.customerName,
          contact: sale.customerContact,
          reviews: [],
        };
      }
      if (sale.customerRemarks) {
        acc[clientKey].reviews.push({
          id: sale.id,
          remarks: sale.customerRemarks,
          date: sale.date,
        });
      }
    }
    return acc;
  }, {});

  const clientList = Object.values(clients).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="text-amber-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-300">Client Directory & Reviews</h1>
        <Button
          variant="outline"
          className="text-amber-100 border-amber-400 hover:bg-amber-800/30 hover:text-amber-50"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
      
      {clientList.length > 0 ? (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {clientList.map((client, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="glass-effect border-amber-800/50 text-amber-100 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-400">
                    <User className="mr-3 h-6 w-6" />
                    <span className="flex-1">{client.name || 'Anonymous Client'}</span>
                  </CardTitle>
                  {client.contact && (
                    <CardDescription className="text-amber-200/70 pt-2 flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      {client.contact}
                    </CardDescription>
                  )}
                </CardHeader>
                {client.reviews.length > 0 && (
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-amber-300 hover:no-underline">
                          View {client.reviews.length} review(s)
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            {client.reviews.sort((a, b) => new Date(b.date) - new Date(a.date)).map(review => (
                              <div key={review.id} className="p-3 rounded-lg bg-black/30 border border-amber-900/50">
                                <p className="italic text-amber-100/90 mb-2">"{review.remarks}"</p>
                                <div className="text-xs text-amber-200/70 flex items-center">
                                  <Calendar className="mr-2 h-3 w-3" />
                                  {new Date(review.date).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 glass-effect rounded-lg border border-amber-800/50">
          <Users className="mx-auto h-12 w-12 text-amber-400/50" />
          <h2 className="mt-4 text-xl font-semibold text-amber-300">No Clients Found</h2>
          <p className="mt-2 text-amber-200/80">Client information captured at the POS terminal will appear here.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ClientReviewsPage;
