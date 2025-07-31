import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { posAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

const POSContext = createContext();

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

export const POSProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptSettings, setReceiptSettings] = useState({
    logo: null,
    companyName: 'Moon Land',
    address: '123 Cosmic Way, Galaxy City',
    phone: '+123 456 7890',
    footer: 'Thank you for your business!',
  });

  // Fetch data from database when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [inventoryData, salesData, expensesData, staffData, categoriesData, receiptSettingsData] = await Promise.all([
          posAPI.getInventory(),
          posAPI.getSales(),
          posAPI.getExpenses(),
          posAPI.getStaff(),
          posAPI.getCategories(),
          posAPI.getReceiptSettings().catch(() => null) // Fallback if endpoint doesn't exist yet
        ]);

        setInventory(inventoryData || []);
        setSales((salesData || []).map(sale => ({
          ...sale,
          total: typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total,
          profit: typeof sale.profit === 'string' ? parseFloat(sale.profit) : sale.profit,
          totalCost: typeof sale.totalCost === 'string' ? parseFloat(sale.totalCost) : sale.totalCost,
        })));
        setExpenses((expensesData || []).map(exp => ({
          ...exp,
          amount: typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount,
        })));
        setStaff(staffData || []);
        setCategories(categoriesData || []);
        
        // Set receipt settings if available, otherwise use defaults
        if (receiptSettingsData) {
          setReceiptSettings(receiptSettingsData);
        }

      } catch (error) {
        console.error('Error fetching POS data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load data from server',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Persist currentShift in localStorage on every change
  useEffect(() => {
    if (currentShift) {
      localStorage.setItem('moonland_current_shift', JSON.stringify(currentShift));
    } else {
      localStorage.removeItem('moonland_current_shift');
    }
  }, [currentShift]);

  // On mount or login, check backend for active shift
  useEffect(() => {
    const restoreShift = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        // Check backend for active shift first
        const activeShift = await posAPI.getActiveShift(user.id);
        if (activeShift) {
          console.log('✅ Found active shift from backend:', activeShift);
          // Map backend field names to frontend expectations
          const mappedShift = {
            id: activeShift.id,
            staff_id: activeShift.staff_id,
            cashierName: activeShift.cashierName || user.username,
            startTime: activeShift.start_time,
            startingCash: activeShift.starting_cash,
            status: activeShift.status
          };
          setCurrentShift(mappedShift);
          localStorage.setItem('moonland_current_shift', JSON.stringify(mappedShift));
          return;
        }
        
        // Fallback: check localStorage (legacy support)
        const saved = localStorage.getItem('moonland_current_shift');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Only restore if shift doesn't have an end time and is marked as active
            if (parsed && !parsed.endTime && parsed.status === 'active') {
              console.log('✅ Restoring shift from localStorage:', parsed);
              setCurrentShift(parsed);
            } else {
              console.log('🗑️ Removing expired shift from localStorage');
              localStorage.removeItem('moonland_current_shift');
            }
          } catch (e) {
            console.error('❌ Error parsing saved shift:', e);
            localStorage.removeItem('moonland_current_shift');
          }
        }
      } catch (error) {
        console.error('❌ Error restoring shift:', error);
        // Don't show toast for shift restoration errors as they're not critical
      }
    };
    
    restoreShift();
  }, [isAuthenticated, user]);

  // Periodic shift validation check
  useEffect(() => {
    if (!currentShift) return;

    const interval = setInterval(() => {
      checkShiftValidity();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentShift]);

  // --- Cart ---
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => setCart(cart.filter(item => item.id !== itemId));

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const updateCartItemPrice = (itemId, newPrice) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id !== itemId) return item;
      const costPrice = item.costPrice ?? 0;
      const originalPrice = item.originalPrice ?? item.price;
      if (newPrice < costPrice) {
        toast({
          title: "Invalid Price",
          description: `The price cannot be lower than the cost price (UGX ${costPrice.toLocaleString()}).`,
          variant: "destructive"
        });
        return item;
      }
      if (newPrice < originalPrice) {
        toast({
          title: "Warning",
          description: `You are making a sale below the selling price (UGX ${originalPrice.toLocaleString()}).`,
          variant: "warning"
        });
      }
      return { ...item, price: newPrice };
    }));
  };

  const clearCart = () => setCart([]);

  // --- Sales ---
  const processSale = async (paymentInfo) => {
    try {
      console.log('🛒 Starting sale process with payment info:', paymentInfo);
      console.log('📦 Current cart:', cart);
      
      // Calculate totals
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalCost = cart.reduce((sum, item) => sum + ((item.costPrice || 0) * item.quantity), 0);
      const profit = total - totalCost;
      const changeGiven = paymentInfo.cashReceived ? parseFloat(paymentInfo.cashReceived) - total : 0;

      console.log('💰 Sale calculations:', { total, totalCost, profit, changeGiven });

      const saleData = {
        items: cart,
        paymentMethod: paymentInfo.paymentMethod,
        customerName: paymentInfo.customerInfo?.name || null,
        customerPhone: paymentInfo.customerInfo?.contact || null,
        total: total,
        totalCost: totalCost,
        profit: profit,
        cashReceived: paymentInfo.cashReceived,
        changeGiven: changeGiven,
        shiftId: currentShift?.id,
        userId: user?.id,
        username: user?.username
      };

      console.log('📤 Sending sale data to API:', saleData);

      const response = await posAPI.processSale(saleData);
      
      console.log('📥 API response:', response);
      
      if (response.success) {
        setSales(prev => [...prev, response.data]);
        setCart([]);
        toast({ title: "Sale Completed", description: `Receipt #${response.data.receiptNumber} generated successfully.` });
        return response.data;
      } else {
        toast({ title: "Error processing sale", description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      console.error('💥 Sale processing error:', error);
      toast({ title: "Error processing sale", description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const payCreditSale = async (saleId) => {
    try {
      const response = await posAPI.payCreditSale(saleId);
      if (response.success) {
        setSales(prev => prev.map(sale => 
          sale.id === saleId ? { ...sale, status: 'paid', paidAt: new Date().toISOString() } : sale
        ));
        toast({ title: "Payment Received", description: "Credit sale has been paid." });
        return true;
      } else {
        toast({ title: "Error processing payment", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error processing payment", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  // --- Expenses ---
  const addExpense = async (expense) => {
    try {
      const expenseData = {
        ...expense,
        shiftId: currentShift?.id,
        cashier: user?.username
      };

      const response = await posAPI.addExpense(expenseData);
      
      if (response.success) {
        setExpenses(prev => [...prev, response.data]);
        toast({ title: "Expense Added", description: `${expense.description} has been recorded.` });
        return response.data;
      } else {
        toast({ title: "Error adding expense", description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      toast({ title: "Error adding expense", description: error.message, variant: 'destructive' });
      return null;
    }
  };

  // --- Shift ---
  const checkShiftValidity = () => {
    if (!currentShift) return false;
    
    // Check if shift has an end time (already ended)
    if (currentShift.endTime || currentShift.status === 'completed') {
      console.log('🗑️ Shift already ended, clearing from state');
      setCurrentShift(null);
      localStorage.removeItem('moonland_current_shift');
      return false;
    }
    
    return true;
  };

  const startShift = async (staffId, cashierName, startingCash) => {
    try {
      const response = await posAPI.startShift({
        staffId,
        startingCash: parseFloat(startingCash)
      });

      if (response.success) {
        const shift = {
          id: response.data.id,
          staff_id: response.data.staffId,
          cashierName,
          startTime: response.data.start_time, // Use the corrected field name
          startingCash: parseFloat(startingCash),
          status: 'active'
        };
        setCurrentShift(shift);
        localStorage.setItem('moonland_current_shift', JSON.stringify(shift));
        toast({ title: "Shift Started", description: `Welcome ${cashierName}!` });
      } else {
        toast({ title: "Error Starting Shift", description: response.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: "Error Starting Shift", description: error.message, variant: 'destructive' });
    }
  };

  const endShift = async (endingCash) => {
    if (!currentShift) return;

    try {
      const response = await posAPI.endShift(currentShift.id, endingCash);

      if (response.success) {
        const shiftSales = sales.filter(sale => new Date(sale.timestamp) >= new Date(currentShift.startTime));
        const totalSales = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
        setCurrentShift(null);
        localStorage.removeItem('moonland_current_shift');
        toast({ title: "Shift Ended", description: `Total sales: UGX ${totalSales.toLocaleString()}` });
      } else {
        toast({ title: "Error Ending Shift", description: response.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: "Error Ending Shift", description: error.message, variant: 'destructive' });
    }
  };

  // --- Inventory ---
  const addInventoryItem = async (item) => {
    try {
      const response = await posAPI.addInventoryItem(item);
      if (response.success) {
        // Refresh the entire inventory to get the complete item data with image
        const inventoryResponse = await posAPI.getInventory();
        if (inventoryResponse) {
          setInventory(inventoryResponse);
          console.log('✅ Inventory refreshed after adding item');
        } else {
          // Fallback: add the item with the response data
          setInventory(prev => [...prev, response.data]);
        }
        toast({ title: "Item Added", description: `${item.name} has been added to inventory.` });
        return response.data;
      } else {
        toast({ title: "Error adding item", description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      toast({ title: "Error adding item", description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const updateInventoryItem = async (id, updatedItem) => {
    try {
      const response = await posAPI.updateInventoryItem(id, updatedItem);
      if (response.success) {
        // Use the returned data from server if available, otherwise refresh inventory
        if (response.data) {
          console.log('✅ Updated item data from server:', response.data);
          setInventory(prev => prev.map(item => item.id === id ? response.data : item));
        } else {
          // Fallback: refresh the entire inventory
          const inventoryResponse = await posAPI.getInventory();
          if (inventoryResponse) {
            setInventory(inventoryResponse);
          } else {
            // Last fallback: update local state with the data we have
            setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
          }
        }
        toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
        return true;
      } else {
        toast({ title: "Error updating item", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error updating item", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const response = await posAPI.deleteInventoryItem(id);
      if (response.success) {
        setInventory(prev => prev.filter(item => item.id !== id));
        toast({ title: "Item Deleted", description: "Item has been removed from inventory." });
        return true;
      } else {
        toast({ title: "Error deleting item", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error deleting item", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const getLowStockItems = () => inventory.filter(item => item.stock <= item.lowStockAlert);

  // --- Staff ---
  const addStaffMember = async (staffMember) => {
    try {
      const response = await posAPI.addStaff(staffMember);
      if (response.success) {
        setStaff(prev => [...prev, response.data]);
        toast({ title: "Staff Added", description: `${staffMember.name} has been added to staff.` });
        return response.data;
      } else {
        toast({ title: "Error adding staff", description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      toast({ title: "Error adding staff", description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const removeStaffMember = async (staffId) => {
    try {
      const response = await posAPI.deleteStaff(staffId);
      if (response.success) {
        setStaff(prev => prev.filter(staff => staff.id !== staffId));
        toast({ title: "Staff Removed", description: "Staff member has been removed." });
        return true;
      } else {
        toast({ title: "Error removing staff", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error removing staff", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const updateStaffMember = async (staffId, updateData) => {
    try {
      const response = await posAPI.updateStaff(staffId, updateData);
      if (response.success) {
        setStaff(prev => prev.map(staff => 
          staff.id === staffId 
            ? { ...staff, ...updateData }
            : staff
        ));
        toast({ title: "Staff Updated", description: "Staff member has been updated." });
        return true;
      } else {
        toast({ title: "Error updating staff", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error updating staff", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  // --- Categories ---
  const addCategory = async (name) => {
    try {
      const response = await posAPI.addCategory({ name });
      if (response.success) {
        setCategories(prev => [...prev, response.data]);
        toast({ title: "Category Added", description: `${name} category has been added.` });
        return response.data;
      } else {
        toast({ title: "Error adding category", description: response.message, variant: 'destructive' });
        return null;
      }
    } catch (error) {
      toast({ title: "Error adding category", description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const removeCategory = async (categoryId) => {
    try {
      const response = await posAPI.deleteCategory(categoryId);
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        toast({ title: "Category Removed", description: "Category has been removed." });
        return true;
      } else {
        toast({ title: "Error removing category", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error removing category", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const updateCategory = async (categoryId, data) => {
    try {
      const response = await posAPI.updateCategory(categoryId, data);
      if (response.success) {
        // Use the returned data from server if available, otherwise use local data
        if (response.data) {
          console.log('✅ Updated category data from server:', response.data);
          setCategories(prev => prev.map(cat => cat.id === categoryId ? response.data : cat));
        } else {
          setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, ...data } : cat));
        }
        toast({ title: "Category Updated", description: "Category has been updated." });
        return true;
      } else {
        toast({ title: "Error updating category", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error updating category", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  // --- Receipt Settings ---
  const updateReceiptSettings = async (newSettings) => {
    const isFormData = newSettings instanceof FormData;
    
    try {
      const response = await posAPI.updateReceiptSettings(newSettings);
      
      if (response.success) {
        setReceiptSettings(response.data);
        toast({ title: "Settings Updated", description: "Receipt settings have been saved." });
        return true;
      } else {
        toast({ title: "Error updating settings", description: response.message, variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: "Error updating settings", description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const value = {
    inventory,
    sales,
    expenses,
    currentShift,
    setCurrentShift,
    cart,
    staff,
    categories,
    isLoading,
    receiptSettings,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemPrice,
    clearCart,
    processSale,
    payCreditSale,
    addExpense,
    startShift,
    endShift,
    checkShiftValidity,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
    addStaffMember,
    removeStaffMember,
    updateStaffMember,
    addCategory,
    removeCategory,
    updateCategory,
    updateReceiptSettings,
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};