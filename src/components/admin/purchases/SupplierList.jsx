import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, User, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast({ title: 'Error', description: 'Failed to load suppliers.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-amber-800/50">
        <CardContent className="p-6">
          <div className="text-center text-amber-200">Loading suppliers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-amber-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-100">
            <User className="w-5 h-5 mr-2" />
            Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-semibold">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact_person || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.phone && (
                            <div className="flex items-center text-sm text-amber-200/80">
                              <Phone className="w-3 h-3 mr-1" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center text-sm text-amber-200/80">
                              <Mail className="w-3 h-3 mr-1" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-amber-200/80">
                          <MapPin className="w-3 h-3 mr-1" />
                          {supplier.city}, {supplier.country}
                        </div>
                      </TableCell>
                      <TableCell>UGX {supplier.credit_limit.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={supplier.is_active ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-100">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-100">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-amber-400/50" />
              <h3 className="mt-4 text-lg font-semibold text-amber-300">No Suppliers</h3>
              <p className="mt-2 text-amber-200/80">Add your first supplier to get started with purchase orders.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierList;
