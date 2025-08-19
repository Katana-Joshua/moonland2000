import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { ShoppingCart, Trash2, DollarSign, PenSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const ManualSaleEntry = () => {
    const { inventory, processSale } = usePOS();
    const [cart, setCart] = useState([]);
    const [date, setDate] = useState(new Date());
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerName, setCustomerName] = useState('');

    const paymentOptions = [
      { value: 'cash', label: 'Cash' },
      { value: 'momo', label: 'Momo' },
      { value: 'airtel', label: 'Airtel' },
      { value: 'bank_deposit', label: 'Bank Deposit' },
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'credit', label: 'Credit' },
    ];

    const handleAddToCart = () => {
        if (!selectedItem || quantity <= 0) return;
        const itemToAdd = inventory.find(i => i.id === selectedItem);
        if (!itemToAdd) return;

        const existingItem = cart.find(ci => ci.id === itemToAdd.id);
        if (existingItem) {
            setCart(cart.map(ci => ci.id === itemToAdd.id ? { ...ci, quantity: ci.quantity + quantity } : ci));
        } else {
            setCart([...cart, { ...itemToAdd, quantity: 1, originalPrice: itemToAdd.price, minPrice: itemToAdd.minPrice }]);
        }
        setSelectedItem('');
        setQuantity(1);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleProcessSale = () => {
        const saleData = {
            paymentMethod,
            customerInfo: { name: customerName },
            date: date
        };
        const sale = processSale(saleData, cart);
        if (sale) {
            setCart([]);
            setCustomerName('');
            setPaymentMethod('cash');
        }
    };

    return (
        <Card className="glass-effect border-amber-800/50">
            <CardHeader>
                <CardTitle className="text-amber-100">Manual Sale Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="sale-date" className="text-amber-200">Transaction Date</Label>
                    <DatePicker date={date} setDate={setDate} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4">
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                            <SelectValue placeholder="Select an item to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {inventory.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.name} (Stock: {item.stock}) - UGX {item.price.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)))} className="w-24 bg-black/20 border-amber-800/50 text-amber-100" />
                    <Button onClick={handleAddToCart}>Add to Cart</Button>
                </div>
                
                <div className="space-y-4">
                    <h4 className="font-semibold text-amber-200">Cart</h4>
                    {cart.length === 0 ? (
                        <p className="text-amber-200/60">Cart is empty.</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                                <div>
                                    <p>{item.name}</p>
                                    <p className="text-sm text-amber-200/70">{item.quantity} x UGX {item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold">UGX {(item.quantity * item.price).toLocaleString()}</p>
                                    <Button size="icon" variant="destructive" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-amber-800/50">
                        <div className="flex justify-between items-center font-bold text-xl">
                            <span className="text-amber-100">Total</span>
                            <span className="text-amber-300">UGX {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="bg-black/20 border-amber-800/50 text-amber-100">
                                    <SelectValue placeholder="Payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {paymentMethod === 'credit' && (
                                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" className="bg-black/20 border-amber-800/50 text-amber-100" />
                            )}
                        </div>
                        <Button onClick={handleProcessSale} className="w-full bg-green-600 hover:bg-green-700">Record Sale</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ManualExpenseEntry = () => {
    const { addExpense } = usePOS();
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount || !date) {
            toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
            return;
        }
        addExpense({ description, amount: parseFloat(amount), date });
        setDescription('');
        setAmount('');
    };

    return (
        <Card className="glass-effect border-amber-800/50">
            <CardHeader>
                <CardTitle className="text-amber-100">Manual Expense Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="expense-date" className="text-amber-200">Expense Date</Label>
                        <DatePicker date={date} setDate={setDate} />
                    </div>
                    <div>
                        <Label htmlFor="description" className="text-amber-200">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Office supplies" className="bg-black/20 border-amber-800/50 text-amber-100" />
                    </div>
                    <div>
                        <Label htmlFor="amount" className="text-amber-200">Amount (UGX)</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-black/20 border-amber-800/50 text-amber-100" />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Record Expense</Button>
                </form>
            </CardContent>
        </Card>
    );
};


const AdminTerminal = () => {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                 <PenSquare className="w-8 h-8 text-amber-400"/>
                 <h1 className="text-3xl font-bold text-amber-100">Manual Entry Terminal</h1>
            </div>
            <p className="mb-8 text-amber-200/80 max-w-2xl">
                This terminal allows you to manually enter transactions. Use this for correcting records, entering missed sales, or recording expenses that happened in the past.
            </p>
            <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-amber-800/50">
                    <TabsTrigger value="sales"><ShoppingCart className="w-4 h-4 mr-2"/>Sales</TabsTrigger>
                    <TabsTrigger value="expenses"><DollarSign className="w-4 h-4 mr-2"/>Expenses</TabsTrigger>
                </TabsList>
                <TabsContent value="sales" className="mt-6">
                    <ManualSaleEntry />
                </TabsContent>
                <TabsContent value="expenses" className="mt-6">
                    <ManualExpenseEntry />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminTerminal;
