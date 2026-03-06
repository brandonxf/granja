import { createContext, useContext, useState, useEffect } from 'react';

// Mock Data - Productos de Granja
const initialProducts = [
  {
    id: 1,
    name: 'Manzana Verde Fresca',
    description: 'Manzanas verdes orgánicas cultivadas en nuestra granja. Crujientes y deliciosas.',
    price: 2500,
    originalPrice: 3000,
    category: 'frutas',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
    isNew: true,
    isOffer: true,
    stock: 50
  },
  {
    id: 2,
    name: 'Leche Fresca de Vaca',
    description: 'Leche fresca pasteurizada directamente de nuestras vacas.',
    price: 4500,
    category: 'lacteos',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: false,
    stock: 30
  },
  {
    id: 3,
    name: 'Huevos Campesinos',
    description: 'Hueros de gallinas criadas en libertad, alimentación natural.',
    price: 1200,
    originalPrice: 1500,
    category: 'huevos',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: true,
    stock: 100
  },
  {
    id: 4,
    name: 'Zanahoria Orgánica',
    description: 'Zanahorias frescas cultivadas sin pesticidas químicos.',
    price: 1800,
    category: 'verduras',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    isNew: true,
    isOffer: false,
    stock: 40
  },
  {
    id: 5,
    name: 'Queso Artesanal',
    description: 'Queso mozzarella fresco hecho a mano con leche de nuestra granja.',
    price: 8500,
    category: 'lacteos',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: false,
    stock: 15
  },
  {
    id: 6,
    name: 'Mermelada de Fresa',
    description: 'Mermelada casera elaborada con fresas de nuestro huerto.',
    price: 5500,
    category: 'artesanales',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: true,
    originalPrice: 6500,
    stock: 25
  },
  {
    id: 7,
    name: 'Pollo de Campo',
    description: 'Pollos criados en libertad, alimentación natural sin hormonas.',
    price: 12000,
    category: 'carnes',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
    isNew: true,
    isOffer: false,
    stock: 20
  },
  {
    id: 8,
    name: 'Miel de Abejas',
    description: 'Miel orgánica pura producida por nuestras propias colmenas.',
    price: 15000,
    category: 'artesanales',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: false,
    stock: 10
  },
  {
    id: 9,
    name: 'Tomates Cherry',
    description: 'Tomates cherry rojos y dulces, perfectos para ensaladas.',
    price: 3500,
    category: 'verduras',
    image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b0?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: false,
    stock: 35
  },
  {
    id: 10,
    name: 'Yogur Natural',
    description: 'Yogur hecho en casa con leche fresca y cultivos vivos.',
    price: 3800,
    originalPrice: 4200,
    category: 'lacteos',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: true,
    stock: 45
  },
  {
    id: 11,
    name: 'Uvas Frescas',
    description: 'Uvas rojas sin semillas, jugosas y dulces.',
    price: 4500,
    category: 'frutas',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop',
    isNew: false,
    isOffer: false,
    stock: 25
  },
  {
    id: 12,
    name: 'Mantequilla Casera',
    description: 'Mantequilla fresca elaborada manualmente.',
    price: 6000,
    category: 'lacteos',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
    isNew: true,
    isOffer: false,
    stock: 18
  }
];

// Mock Orders
const initialOrders = [
  { id: 1, client: 'Juan Pérez', total: 25000, date: '2026-03-04', status: 'pendiente' },
  { id: 2, client: 'María García', total: 18500, date: '2026-03-03', status: 'entregado' },
  { id: 3, client: 'Carlos López', total: 32000, date: '2026-03-03', status: 'pendiente' },
  { id: 4, client: 'Ana Martínez', total: 12000, date: '2026-03-02', status: 'entregado' },
  { id: 5, client: 'Pedro Sánchez', total: 45000, date: '2026-03-01', status: 'entregado' },
];

// Categories
const categories = [
  { id: 'all', name: 'Todos', icon: 'Grid' },
  { id: 'frutas', name: 'Frutas', icon: 'Apple' },
  { id: 'verduras', name: 'Verduras', icon: 'Carrot' },
  { id: 'lacteos', name: 'Lácteos', icon: 'Milk' },
  { id: 'huevos', name: 'Huevos', icon: 'Egg' },
  { id: 'carnes', name: 'Carnes', icon: 'Beef' },
  { id: 'artesanales', name: 'Artesanales', icon: 'Sprout' },
];

const AppContext = createContext();

export function AppProvider({ children }) {
  // Products State
  const [products, setProducts] = useState(initialProducts);
  const [productIdCounter, setProductIdCounter] = useState(100);
  
  // Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('granjaverde-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Auth State
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('granjaverde-admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  
  // Orders State
  const [orders] = useState(initialOrders);
  
  // Toast State
  const [toast, setToast] = useState(null);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('granjaverde-cart', JSON.stringify(cart));
  }, [cart]);

  // Persist Admin
  useEffect(() => {
    if (admin) {
      localStorage.setItem('granjaverde-admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('granjaverde-admin');
    }
  }, [admin]);

  // Cart Functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} agregado al carrito`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Admin Functions
  const loginAdmin = (email, password) => {
    if (email === 'admin@granjaverde.com' && password === 'admin123') {
      const adminData = { email, name: 'Administrador', token: 'mock-jwt-token' };
      setAdmin(adminData);
      showToast('Bienvenido al panel de administración', 'success');
      return true;
    }
    showToast('Credenciales incorrectas', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setAdmin(null);
    showToast('Sesión cerrada correctamente', 'success');
  };

  // Product Functions (Admin)
  const addProduct = (product) => {
    const newId = productIdCounter + 1;
    setProductIdCounter(newId);
    const newProduct = { ...product, id: newId };
    setProducts(prev => [...prev, newProduct]);
    showToast('Producto agregado correctamente', 'success');
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Producto actualizado correctamente', 'success');
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Producto eliminado correctamente', 'success');
  };

  // Toast Function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const value = {
    // Products
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    
    // Admin
    admin,
    loginAdmin,
    logoutAdmin,
    
    // Orders
    orders,
    
    // Toast
    toast,
    showToast
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
