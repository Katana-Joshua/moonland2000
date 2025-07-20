import React, { useState } from 'react';
import { useAccounting } from '@/contexts/AccountingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Library, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ChartOfAccounts = () => {
  const { accounts, addAccount, loadingAccounts } = useAccounting();
  const [open, setOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: '', description: '' });

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.type) {
        toast({ title: "Validation Error", description: "Account name and type are required.", variant: "destructive" });
        return;
    }
    
    const created = await addAccount(newAccount);
    if(created) {
        setNewAccount({ name: '', type: '', description: '' });
        setOpen(false);
    }
  };

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <Card className="glass-effect border-amber-800/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div >
            <CardTitle className="flex items-center text-amber-100">
              <Library className="w-6 h-6 mr-2" />
              Chart of Accounts
            </CardTitle>
            <CardDescription className="text-amber-200/60">Manage your financial accounts here.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <PlusCircle className="w-4 h-4 mr-2"/>
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-stone-900 border-amber-800/50 text-amber-100">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
                <DialogDescription className="text-amber-200/70">
                  Add a new ledger account to your chart of accounts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="col-span-3 bg-black/20 border-amber-800/50" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select onValueChange={value => setNewAccount({...newAccount, type: value})}>
                        <SelectTrigger className="col-span-3 bg-black/20 border-amber-800/50">
                            <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                            {accountTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={newAccount.description} onChange={e => setNewAccount({...newAccount, description: e.target.value})} className="col-span-3 bg-black/20 border-amber-800/50" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Save Account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loadingAccounts ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-amber-400" />
                <span className="text-amber-100">Loading Accounts...</span>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {[...accounts].sort((a,b) => a.name.localeCompare(b.name)).map(account => (
                    <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>{account.description}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartOfAccounts;