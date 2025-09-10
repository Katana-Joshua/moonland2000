import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const SupplierForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kampala',
    country: 'Uganda',
    payment_terms: '',
    credit_limit: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({ title: 'Validation Error', description: 'Supplier name is required.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: 'Supplier added successfully.' });
        onSubmit(data);
      } else {
        throw new Error('Failed to add supplier');
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({ title: 'Error', description: 'Failed to add supplier.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-amber-200">Supplier Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="Enter supplier name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person" className="text-amber-200">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="Contact person name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-amber-200">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="supplier@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-amber-200">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="+256700123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-amber-200">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="Kampala"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-amber-200">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="Uganda"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-amber-200">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-black/20 border-amber-800/50 text-amber-100"
          placeholder="Enter full address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_terms" className="text-amber-200">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="e.g., Net 30 days"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit_limit" className="text-amber-200">Credit Limit (UGX)</Label>
          <Input
            id="credit_limit"
            type="number"
            value={formData.credit_limit}
            onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
          {isLoading ? 'Adding...' : 'Add Supplier'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-amber-800/50 text-amber-100">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
