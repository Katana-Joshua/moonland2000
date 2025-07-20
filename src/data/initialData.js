
export const initialCategories = [
  { name: 'Beer', image: 'https://images.unsplash.com/photo-1587061931332-34d2a86145f9?w=300&h=300&fit=crop' },
  { name: 'Spirits', image: 'https://images.unsplash.com/photo-1614313519810-2547343143b4?w=300&h=300&fit=crop' },
  { name: 'Wine', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b6e?w=300&h=300&fit=crop' },
  { name: 'Cocktails', image: 'https://images.unsplash.com/photo-1546173158-31672242757c?w=300&h=300&fit=crop' },
  { name: 'Food', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop' },
  { name: 'Snacks', image: 'https://images.unsplash.com/photo-1600359768329-b33f5bbf4a35?w=300&h=300&fit=crop' }
];

export const initialInventory = [
  {
    id: '1',
    name: 'Beer - Lager',
    category: 'Beer',
    price: 10000,
    minPrice: 9500,
    costPrice: 4500,
    stock: 120,
    lowStockAlert: 20,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop',
    barcode: '6291014250015'
  },
  {
    id: '2',
    name: 'Whiskey - Premium',
    category: 'Spirits',
    price: 25000,
    minPrice: 24000,
    costPrice: 15000,
    stock: 45,
    lowStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop',
    barcode: '8901133101013'
  },
  {
    id: '3',
    name: 'Wine - Red',
    category: 'Wine',
    price: 18000,
    minPrice: 18000,
    costPrice: 9000,
    stock: 30,
    lowStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop',
    barcode: '034100570109'
  },
  {
    id: '4',
    name: 'Cocktail - Mojito',
    category: 'Cocktails',
    price: 20000,
    minPrice: 19000,
    costPrice: 8000,
    stock: 25,
    lowStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&h=300&fit=crop',
    barcode: ''
  },
  {
    id: '5',
    name: 'Nachos',
    category: 'Snacks',
    price: 15000,
    minPrice: 15000,
    costPrice: 7000,
    stock: 40,
    lowStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&h=300&fit=crop',
    barcode: '725272730706'
  },
  {
    id: '6',
    name: 'Wings - Buffalo',
    category: 'Food',
    price: 22000,
    minPrice: 20000,
    costPrice: 12000,
    stock: 35,
    lowStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=300&fit=crop',
    barcode: ''
  }
];

export const initialStaff = [
  { id: 'staff-1', name: 'John Doe', role: 'Cashier', pin: '1234' },
  { id: 'staff-2', name: 'Jane Smith', role: 'Cashier', pin: '4321' },
  { id: 'staff-3', name: 'Admin User', role: 'Admin', pin: '0000' }
];
