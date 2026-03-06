import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  Package as PackageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { admin, logoutAdmin, products, orders, addProduct, updateProduct, deleteProduct } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Productos' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
    { id: 'stats', icon: BarChart3, label: 'Estadísticas' },
  ];

  // Stats calculations
  const totalProducts = products.length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalClients = 124;

  const stats = [
    { icon: PackageIcon, label: 'Total Productos', value: totalProducts, color: '#2D5A27' },
    { icon: ShoppingCart, label: 'Pedidos Pendientes', value: pendingOrders, color: '#FFA000' },
    { icon: DollarSign, label: 'Ingresos del Mes', value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: '#388E3C' },
    { icon: Users, label: 'Clientes', value: totalClients, color: '#5D4037' },
  ];

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">GranjaVerde</h2>
          <span className="sidebar-badge">Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activeSection === id ? 'nav-active' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <h1 className="admin-page-title">Dashboard</h1>
              <p className="admin-page-subtitle">Bienvenido de nuevo, {admin.name}</p>
            </div>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="stat-card fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="stat-icon" style={{ background: stat.color }}>
                    <stat.icon size={24} color="white" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-orders">
              <h2 className="section-title-admin">Pedidos Recientes</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.client}</td>
                        <td>{order.date}</td>
                        <td>${order.total.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        {activeSection === 'products' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <h1 className="admin-page-title">Gestión de Productos</h1>
              <button 
                className="add-product-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
              >
                <Plus size={18} />
                Agregar Producto
              </button>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="product-thumb"
                        />
                      </td>
                      <td>{product.name}</td>
                      <td className="capitalize">{product.category}</td>
                      <td>${product.price.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <h1 className="admin-page-title">Gestión de Pedidos</h1>
            </div>

            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.client}</td>
                      <td>{order.date}</td>
                      <td>${order.total.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {activeSection === 'stats' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <h1 className="admin-page-title">Estadísticas</h1>
            </div>

            <div className="stats-placeholder">
              <BarChart3 size={64} />
              <h3>Próximamente</h3>
              <p>Las estadísticas detalladas estarán disponibles pronto</p>
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal 
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={(productData) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, productData);
            } else {
              addProduct(productData);
            }
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'frutas',
    stock: product?.stock || 0,
    image: product?.image || '',
    isNew: product?.isNew || false,
    isOffer: product?.isOffer || false,
  });

  const categories = ['frutas', 'verduras', 'lacteos', 'huevos', 'carnes', 'artesanales'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          {product ? 'Editar Producto' : 'Agregar Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>URL de Imagen</label>
            <input
              type="url"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
              />
              Producto Nuevo
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.isOffer}
                onChange={e => setFormData({ ...formData, isOffer: e.target.checked })}
              />
              En Oferta
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
