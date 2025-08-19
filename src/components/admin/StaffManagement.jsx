import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, User, KeyRound, Shield, Edit, Upload } from 'lucide-react';
import DataImporter from '@/components/admin/DataImporter';
import { availablePermissions, defaultPermissions } from '@/contexts/dataManager';
import { Checkbox } from '@/components/ui/checkbox';

const StaffForm = ({ staffMember, onSave, closeDialog }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cashier',
    username: '',
    email: '',
    password: '',
    permissions: defaultPermissions.Cashier,
  });

  useEffect(() => {
    if (staffMember) {
      setFormData({
        name: staffMember.name,
        role: staffMember.role,
        username: staffMember.username || '',
        email: staffMember.email || '',
        password: '', // Don't pre-fill password for security
        permissions: staffMember.permissions || defaultPermissions[staffMember.role],
      });
    } else {
    setFormData({
      name: '',
      role: 'Cashier',
        username: '',
        email: '',
        password: '',
        permissions: defaultPermissions.Cashier,
      });
    }
  }, [staffMember]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: defaultPermissions[newRole] || [],
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Error", description: "Please provide a name.", variant: "destructive" });
      return;
    }
    if (!staffMember && (!formData.username || !formData.password)) {
      toast({ title: "Error", description: "Please provide username and password for login access.", variant: "destructive" });
      return;
    }
    
    const dataToSave = { ...formData };
    if (!formData.password) {
      delete dataToSave.password; // Don't save empty password
    }
    
    onSave(dataToSave);
    closeDialog();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={handleRoleChange}
          className="w-full h-10 px-3 rounded-md bg-black/20 border border-amber-800/50 text-amber-100"
        >
          <option value="Cashier">Cashier</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div>
        <Label className="text-amber-200">Username {staffMember ? '(leave blank to keep current)' : '*'}</Label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="bg-black/20 border-amber-800/50 text-amber-100"
          required={!staffMember}
          placeholder={staffMember ? "Enter new username or leave blank" : "Enter username for login"}
        />
      </div>

      <div>
        <Label className="text-amber-200">Email {staffMember ? '(leave blank to keep current)' : '*'}</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-black/20 border-amber-800/50 text-amber-100"
          required={!staffMember}
          placeholder={staffMember ? "Enter new email or leave blank" : "Enter email address"}
        />
      </div>

      {!staffMember && (
        <div>
          <Label className="text-amber-200">Password *</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="bg-black/20 border-amber-800/50 text-amber-100"
            required
            minLength="6"
            placeholder="Enter password for login"
          />
        </div>
      )}
      
      <div>
        <Label className="text-amber-200">Permissions</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto bg-black/20 p-3 rounded-md">
          {availablePermissions.map(permission => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={permission.id}
                checked={formData.permissions.includes(permission.id)}
                onCheckedChange={() => handlePermissionChange(permission.id)}
                className="border-amber-600 data-[state=checked]:bg-amber-600"
              />
              <Label htmlFor={permission.id} className="text-sm text-amber-200 cursor-pointer">
                <div className="font-medium">{permission.label}</div>
                <div className="text-xs text-amber-200/60">{permission.description}</div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
          {staffMember ? 'Update Staff Member' : 'Add Staff Member'}
        </Button>
        <Button type="button" variant="outline" onClick={closeDialog}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const StaffManagement = () => {
  const { staff, addStaffMember, removeStaffMember, updateStaffMember } = usePOS();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleAdd = async (formData) => {
    const result = await addStaffMember(formData);
    if (result) {
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdate = async (formData) => {
    const result = await updateStaffMember(editingStaff.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingStaff(null);
    }
  };

  const handleImport = async (importedData) => {
    try {
      for (const member of importedData) {
        await addStaffMember({
          name: member.name,
          role: member.role || 'Cashier',
          username: member.username || member.name?.toLowerCase().replace(/\s+/g, ''),
          email: member.email || `${member.name?.toLowerCase().replace(/\s+/g, '')}@example.com`,
          password: member.password || 'password123',
          permissions: defaultPermissions[member.role || 'Cashier'] || defaultPermissions.Cashier,
        });
      }
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      await removeStaffMember(id);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-amber-100">Staff Management</h2>
        <div className="flex gap-2 self-start sm:self-center">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-amber-800/50 text-amber-100">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-amber-800/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Import Staff Data</DialogTitle>
              </DialogHeader>
              <DataImporter dataType="staff" onImport={handleImport} />
            </DialogContent>
          </Dialog>
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
              <StaffForm onSave={handleAdd} closeDialog={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Edit Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm 
            staffMember={editingStaff} 
            onSave={handleUpdate} 
            closeDialog={() => setIsEditDialogOpen(false)} 
          />
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
                  <div className="flex items-center gap-2 text-sm text-blue-200/70 bg-blue-950/20 p-2 rounded-md">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Permissions: {member.permissions?.length || 0} granted</span>
                  </div>
                  {member.username && (
                    <div className="flex items-center gap-2 text-sm text-green-200/70 bg-green-950/20 p-2 rounded-md">
                      <User className="w-4 h-4 text-green-500" />
                      <span>Login: {member.username}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-purple-200/70 bg-purple-950/20 p-2 rounded-md">
                      <User className="w-4 h-4 text-purple-500" />
                      <span>Email: {member.email}</span>
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