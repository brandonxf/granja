import { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI, authAPI } from '../api/client';

// Categories
const defaultCategories = [
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);
  
  // Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('manjaresdelcampo-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Auth State
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('manjaresdelcampo-admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  
  // Orders State
  const [orders, setOrders] = useState([]);
  
  // Toast State
  const [toast, setToast] = useState(null);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('manjaresdelcampo-cart', JSON.stringify(cart));
  }, [cart]);

  // Persist Admin
  useEffect(() => {
    if (admin) {
      localStorage.setItem('manjaresdelcampo-admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('manjaresdelcampo-admin');
    }
  }, [admin]);

  // Cargar productos desde la API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías desde la API
  const loadCategories = async () => {
    try {
      const data = await productsAPI.getCategories();
      if (data.length > 0) {
        // Mapeo de nombres de categorías a iconos
        const iconMapping = {
          'Verduras': 'Carrot',
          'Frutas': 'Apple',
          'Huevos': 'Egg',
          'Lácteos': 'Milk',
          'Carnes': 'Beef',
          'Artesanales': 'Sprout'
        };
        const apiCategories = data
          .filter(cat => cat.active !== false)
          .map(cat => ({
          id: cat.id.toString(),
          name: cat.name,
          icon: iconMapping[cat.name] || 'Grid'
        }));
        setCategories([{ id: 'all', name: 'Todos', icon: 'Grid' }, ...apiCategories]);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

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

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Admin Functions
  const loginAdmin = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      const adminData = { 
        id: data.admin.id,
        email: data.admin.email,
        name: data.admin.name,
        last_name: data.admin.last_name || '',
        phone: data.admin.phone || '',
        role: data.admin.role || 'admin',
        created_at: data.admin.created_at,
        token: data.token
      };
      localStorage.setItem('adminToken', data.token);
      setAdmin(adminData);
      showToast('Bienvenido al panel de administración', 'success');
      return true;
    } catch (error) {
      showToast(error.message || 'Credenciales incorrectas', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    authAPI.logout();
    setAdmin(null);
    showToast('Sesión cerrada correctamente', 'success');
  };

  // Product Functions (Admin)
  const addProduct = async (product) => {
    try {
      const newProduct = await productsAPI.create(product);
      setProducts(prev => [newProduct, ...prev]);
      showToast('Producto agregado correctamente', 'success');
      return newProduct;
    } catch (error) {
      showToast(error.message || 'Error al agregar producto', 'error');
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const updatedProduct = await productsAPI.update(id, updates);
      setProducts(prev => prev.map(p => p.id === parseInt(id) ? updatedProduct : p));
      showToast('Producto actualizado correctamente', 'success');
      return updatedProduct;
    } catch (error) {
      showToast(error.message || 'Error al actualizar producto', 'error');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== parseInt(id)));
      showToast('Producto eliminado correctamente', 'success');
    } catch (error) {
      showToast(error.message || 'Error al eliminar producto', 'error');
      throw error;
    }
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
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
    
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
    setAdmin,
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
