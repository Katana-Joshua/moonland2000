import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, User, KeyRound, Shield, Edit } from 'lucide-react';

const StaffManagement = () => {
  const { staff, addStaffMember, removeStaffMember, updateStaffMember } = usePOS();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cashier',
    pin: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Cashier',
      pin: ''
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pin) {
      toast({
        title: "Error",
        description: "Please provide a name and a PIN.",
        variant: "destructive"
      });
      return;
    }
    if (formData.pin.length < 4) {
      toast({
        title: "Error",
        description: "PIN must be at least 4 digits.",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addStaffMember(formData);
    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      await removeStaffMember(id);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      pin: '' // Don't show current PIN for security
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please provide a name.",
        variant: "destructive"
      });
      return;
    }
    if (formData.pin && formData.pin.length < 4) {
      toast({
        title: "Error",
        description: "PIN must be at least 4 digits.",
        variant: "destructive"
      });
      return;
    }
    
    const updateData = {
      name: formData.name,
      role: formData.role
    };
    
    // Only include PIN if it was changed
    if (formData.pin) {
      updateData.pin = formData.pin;
    }
    
    const result = await updateStaffMember(editingStaff.id, updateData);
    if (result) {
      resetForm();
      setIsEditDialogOpen(false);
      setEditingStaff(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-amber-100">Staff Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 self-start sm:self-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-amber-800/50">
            <DialogHeader>
              <DialogTitle className="text-amber-100">Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label className="text-amber-200">Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black/20 border-amber-800/50 text-amber-100"
                  required
                />
              </div>
              <div>
                <Label className="text-amber-200">Role</Label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full h-10 px-3 rounded-md bg-black/20 border border-amber-800/50 text-amber-100"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <Label className="text-amber-200">PIN (4+ digits) *</Label>
                <Input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value})}
                  className="bg-black/20 border-amber-800/50 text-amber-100"
                  required
                  minLength="4"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Add Staff Member
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Edit Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label className="text-amber-200">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                required
              />
            </div>
            <div>
              <Label className="text-amber-200">Role</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full h-10 px-3 rounded-md bg-black/20 border border-amber-800/50 text-amber-100"
              >
                <option value="Cashier">Cashier</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <Label className="text-amber-200">New PIN (leave blank to keep current)</Label>
              <Input
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value})}
                className="bg-black/20 border-amber-800/50 text-amber-100"
                minLength="4"
                placeholder="Enter new PIN or leave blank"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                Update Staff Member
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border-amber-800/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-amber-950/50 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-400"/>
                     </div>
                     <div>
                        <h3 className="font-semibold text-amber-100">{member.name}</h3>
                        <p className="text-sm text-amber-200/80 flex items-center">
                            {member.role === 'Admin' ? <Shield className="w-3 h-3 mr-1 text-green-400"/> : <User className="w-3 h-3 mr-1"/>}
                            {member.role}
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(member)}
                      className="h-8 w-8 p-0 hover:bg-amber-950/50"
                    >
                      <Edit className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(member.id)}
                      className="h-8 w-8 p-0 hover:bg-red-950/50"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-amber-200/70 bg-black/20 p-2 rounded-md">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>PIN: ****</span>
                  </div>
                  {member.username && (
                    <div className="flex items-center gap-2 text-sm text-green-200/70 bg-green-950/20 p-2 rounded-md">
                      <User className="w-4 h-4 text-green-500" />
                      <span>Login: {member.username}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StaffManagement;