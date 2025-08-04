// API Base URL - change this for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://moonland519-production.up.railway.app/api';

// Backend URL for image serving - change this for production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://moonland519-production.up.railway.app';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('moonland_token');
  console.log('🔑 Getting auth token:', token ? 'Token exists' : 'No token found');
  return token;
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('moonland_token', token);
  } else {
    localStorage.removeItem('moonland_token');
  }
};

// Helper function to get user data
const getUser = () => {
  const userStr = localStorage.getItem('moonland_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set user data
const setUser = (user) => {
  if (user) {
    localStorage.setItem('moonland_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('moonland_user');
  }
};

// Helper function to build image URL
const buildImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}${imagePath}`;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  // For FormData, don't set Content-Type (let browser set it)
  const isFormData = options.body instanceof FormData;
  
  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  console.log('🔐 API Request:', {
    endpoint,
    hasToken: !!token,
    isFormData,
    headers: config.headers
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', response.status, data);
      
      // Handle token expiration - only for actual token expired messages
      if (response.status === 401 && data.message === 'Token expired') {
        console.log('🔄 Token expired, logging out user');
        handleTokenExpiration();
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Handle other authentication errors - but be more specific
      if (response.status === 401 && (data.message === 'Access token required' || data.message === 'Invalid token')) {
        console.log('🔐 Authentication error, logging out user');
        handleTokenExpiration();
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Handle token expiration
const handleTokenExpiration = () => {
  console.log('🔄 Handling token expiration...');
  
  // Clear all authentication data
  setAuthToken(null);
  setUser(null);
  localStorage.removeItem('moonland_current_shift');
  localStorage.removeItem('moonland_token');
  localStorage.removeItem('moonland_user');
  
  // Dispatch a custom event to notify the app about token expiration
  window.dispatchEvent(new CustomEvent('tokenExpired', {
    detail: { message: 'Your session has expired. Please log in again.' }
  }));
};

// ===== AUTHENTICATION API =====

export const authAPI = {
  // Login
  login: async (username, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

  // Register (admin only)
  register: async (username, password, role) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
    return response;
  },

  // Get profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Logout
  logout: () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('moonland_shift');
  },

  // Get current user
  getCurrentUser: () => {
    return getUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
      });

      if (response.success) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        console.log('🔄 Token refreshed successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, handle as token expiration
      handleTokenExpiration();
      throw error;
    }
  },

  // Check token validity
  checkTokenValidity: async () => {
    try {
      const response = await apiRequest('/auth/profile');
      return response.success;
    } catch (error) {
      return false;
    }
  },
};

// ===== POS API =====

export const posAPI = {
  // Inventory
  getInventory: async () => {
    const response = await apiRequest('/pos/inventory');
    return response.data;
  },

  addInventoryItem: async (item) => {
    const formData = new FormData();
    
    // Add all item data to FormData
    Object.keys(item).forEach(key => {
      if (key === 'imageFile' && item[key]) {
        formData.append('image', item[key]);
      } else if (item[key] !== null && item[key] !== undefined) {
        formData.append(key, item[key]);
      }
    });

    const response = await apiRequest('/pos/inventory', {
      method: 'POST',
      body: formData
      // Don't override headers - let apiRequest handle Authorization
    });
    return response;
  },

  updateInventoryItem: async (id, item) => {
    const formData = new FormData();
    
    console.log('📤 Update inventory item data:', item);
    
    // Add all item data to FormData
    Object.keys(item).forEach(key => {
      if (key === 'imageFile' && item[key]) {
        console.log('📁 Adding image file to FormData:', item[key].name, item[key].size);
        formData.append('image', item[key]);
      } else if (item[key] !== null && item[key] !== undefined) {
        console.log('📝 Adding field to FormData:', key, item[key]);
        formData.append(key, item[key]);
      }
    });

    console.log('📦 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log('  ', key, ':', value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
    }

    const response = await apiRequest(`/pos/inventory/${id}`, {
      method: 'PUT',
      body: formData
      // Don't override headers - let apiRequest handle Authorization
    });
    return response;
  },

  deleteInventoryItem: async (id) => {
    const response = await apiRequest(`/pos/inventory/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Sales
  getSales: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await apiRequest(`/pos/sales?${params.toString()}`);
    return response.data;
  },

  processSale: async (saleData) => {
    const response = await apiRequest('/pos/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
    return response;
  },

  payCreditSale: async (saleId) => {
    const response = await apiRequest(`/pos/sales/${saleId}/pay`, {
      method: 'PUT',
    });
    return response;
  },

  // Shifts
  getShifts: async () => {
    const response = await apiRequest('/pos/shifts');
    return response.data;
  },

  startShift: async (shiftData) => {
    const response = await apiRequest('/pos/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
    return response;
  },

  endShift: async (shiftId, endingCash) => {
    const response = await apiRequest(`/pos/shifts/${shiftId}/end`, {
      method: 'PUT',
      body: JSON.stringify({ endingCash }),
    });
    return response;
  },

  // Expenses
  getExpenses: async () => {
    const response = await apiRequest('/pos/expenses');
    return response.data;
  },

  addExpense: async (expense) => {
    const response = await apiRequest('/pos/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return response;
  },

  // Categories
  getCategories: async () => {
    const response = await apiRequest('/pos/categories');
    return response.data;
  },

  addCategory: async (category) => {
    const response = await apiRequest('/pos/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response;
  },

  // Staff
  getStaff: async () => {
    const response = await apiRequest('/pos/staff');
    return response.data;
  },

  addStaff: async (staff) => {
    const response = await apiRequest('/pos/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
    return response;
  },

  deleteStaff: async (staffId) => {
    const response = await apiRequest(`/pos/staff/${staffId}`, {
      method: 'DELETE',
    });
    return response;
  },

  updateStaff: async (staffId, staff) => {
    const response = await apiRequest(`/pos/staff/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    });
    return response;
  },

  // Categories
  getCategories: async () => {
    const response = await apiRequest('/pos/categories');
    return response.data;
  },

  addCategory: async (category) => {
    const response = await apiRequest('/pos/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response;
  },

  deleteCategory: async (categoryId) => {
    const response = await apiRequest(`/pos/categories/${categoryId}`, {
      method: 'DELETE',
    });
    return response;
  },

  updateCategory: async (categoryId, category) => {
    // Check if there's a file to upload
    if (category.imageFile) {
      const formData = new FormData();
      
      console.log('📤 Update category with image:', category);
      
      // Add all category data to FormData
      Object.keys(category).forEach(key => {
        if (key === 'imageFile' && category[key]) {
          console.log('📁 Adding category image file to FormData:', category[key].name, category[key].size);
          formData.append('image', category[key]);
        } else if (category[key] !== null && category[key] !== undefined) {
          console.log('📝 Adding category field to FormData:', key, category[key]);
          formData.append(key, category[key]);
        }
      });

      console.log('📦 Category FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log('  ', key, ':', value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }

      const response = await apiRequest(`/pos/categories/${categoryId}`, {
        method: 'PUT',
        body: formData
      });
      return response;
    } else {
      // No file, send as JSON
      const response = await apiRequest(`/pos/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
      return response;
    }
  },

  getActiveShift: async (userId) => {
    const response = await apiRequest(`/pos/shifts/active${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  },

  // Receipt Settings
  getReceiptSettings: async () => {
    const response = await apiRequest('/pos/receipt-settings');
    return response.data;
  },

  updateReceiptSettings: async (settings) => {
    // Check if settings is FormData (for file upload) or regular object
    const isFormData = settings instanceof FormData;
    
    if (isFormData) {
      // Handle file upload with FormData
      const response = await apiRequest('/pos/receipt-settings', {
        method: 'PUT',
        body: settings,
      });
      return response;
    } else {
      // Handle regular JSON data (backward compatibility)
      const response = await apiRequest('/pos/receipt-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response;
    }
  },
};

// ===== ACCOUNTING API =====

export const accountingAPI = {
  // Accounts
  getAccounts: async () => {
    const response = await apiRequest('/accounting/accounts');
    return response.data;
  },

  addAccount: async (account) => {
    const response = await apiRequest('/accounting/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
    return response;
  },

  // Vouchers
  getVouchers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiRequest(`/accounting/vouchers?${params.toString()}`);
    return response.data;
  },

  getVoucherDetails: async (voucherId) => {
    const response = await apiRequest(`/accounting/vouchers/${voucherId}`);
    return response.data;
  },

  addVoucher: async (voucher) => {
    const response = await apiRequest('/accounting/vouchers', {
      method: 'POST',
      body: JSON.stringify(voucher),
    });
    return response;
  },

  // Reports
  getTrialBalance: async () => {
    const response = await apiRequest('/accounting/reports/trial-balance');
    return response.data;
  },

  getProfitLoss: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiRequest(`/accounting/reports/profit-loss?${params.toString()}`);
    return response.data;
  },

  getBalanceSheet: async () => {
    const response = await apiRequest('/accounting/reports/balance-sheet');
    return response.data;
  },

  getDayBook: async (date) => {
    const response = await apiRequest(`/accounting/reports/day-book?date=${date}`);
    return response.data;
  },
};

// ===== UTILITY FUNCTIONS =====

// Convert Supabase-style data to API format
export const convertSupabaseData = {
  // Convert inventory item
  inventoryItem: (item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
    costPrice: parseFloat(item.cost_price),
    minPrice: item.min_price ? parseFloat(item.min_price) : null,
    stock: parseInt(item.stock),
    lowStockAlert: parseInt(item.low_stock_alert),
    categoryId: item.category_id,
    imageUrl: item.image_url,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }),

  // Convert sale
  sale: (sale) => ({
    id: sale.id,
    receiptNumber: sale.receipt_number,
    total: parseFloat(sale.total),
    totalCost: parseFloat(sale.total_cost),
    profit: parseFloat(sale.profit),
    paymentMethod: sale.payment_method,
    customerInfo: {
      name: sale.customer_name,
      phone: sale.customer_phone,
    },
    status: sale.status,
    cashierName: sale.cashier_name,
    cashReceived: sale.cash_received ? parseFloat(sale.cash_received) : null,
    changeGiven: sale.change_given ? parseFloat(sale.change_given) : null,
    shiftId: sale.shift_id,
    timestamp: sale.timestamp,
    paidAt: sale.paid_at,
  }),

  // Convert shift
  shift: (shift) => ({
    id: shift.id,
    staffId: shift.staff_id,
    staffName: shift.staff_name,
    startTime: shift.start_time,
    endTime: shift.end_time,
    startingCash: parseFloat(shift.starting_cash),
    endingCash: shift.ending_cash ? parseFloat(shift.ending_cash) : null,
    status: shift.status,
    createdAt: shift.created_at,
  }),

  // Convert expense
  expense: (expense) => ({
    id: expense.id,
    description: expense.description,
    amount: parseFloat(expense.amount),
    category: expense.category,
    cashier: expense.cashier,
    shiftId: expense.shift_id,
    timestamp: expense.timestamp,
  }),
};

// ===== UPLOAD API =====

export const uploadAPI = {
  // Upload single image
  uploadImage: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Add optimization options
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else {
        formData.append(key, value.toString());
      }
    });

    const response = await apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
    return response;
  },

  // Upload multiple images
  uploadImages: async (files, options = {}) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Add optimization options
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else {
        formData.append(key, value.toString());
      }
    });

    const response = await apiRequest('/upload/images', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
    return response;
  },

  // Create image variants
  createVariants: async (file, variants = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    
    if (Object.keys(variants).length > 0) {
      formData.append('variants', JSON.stringify(variants));
    }

    const response = await apiRequest('/upload/variants', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
    return response;
  },

  // Delete image
  deleteImage: async (filename) => {
    const response = await apiRequest(`/upload/image/${filename}`, {
      method: 'DELETE'
    });
    return response;
  },

  // Get image info
  getImageInfo: async (filename) => {
    const response = await apiRequest(`/upload/info/${filename}`);
    return response;
  },

  // Get image URL
  getImageUrl: (filename) => {
    return `${API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
  }
};

// Export default API object
export default {
  auth: authAPI,
  pos: posAPI,
  accounting: accountingAPI,
  upload: uploadAPI,
  convert: convertSupabaseData,
};

// Export utility functions
export { buildImageUrl, BACKEND_URL }; 