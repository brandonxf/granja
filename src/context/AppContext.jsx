import { createContext, useContext, useState, useEffect } from 'react';

// Mock Data - Productos de Granja
const initialProducts = [
  
];

// Mock Orders
const initialOrders = [
  
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
