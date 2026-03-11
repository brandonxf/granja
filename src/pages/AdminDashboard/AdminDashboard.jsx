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
  Package as PackageIcon,
  Image
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uploadAPI } from '../../api/client';
import './AdminDashboard.css';

const API_URL = 'https://granja-production.up.railway.app';

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
  

  const stats = [
    { icon: PackageIcon, label: 'Total Productos', value: totalProducts, color: '#2D5A27' },
    { icon: ShoppingCart, label: 'Pedidos Pendientes', value: pendingOrders, color: '#FFA000' },
    { icon: DollarSign, label: 'Ingresos del Mes', value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: '#388E3C' },
    { icon: Users, label: 'Clientes', color: '#5D4037' },
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
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="product-thumb"
                          />
                        ) : (
                          <div className="product-thumb-placeholder">
                            <Image size={20} />
                          </div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td className="capitalize">{product.category_name || 'Sin categoría'}</td>
                      <td>${parseFloat(product.price).toLocaleString()}</td>
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
  const { categories } = useApp();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category_id: product?.category_id || 1,
    stock: product?.stock || 0,
    image_url: product?.image_url || '',
    unit: product?.unit || 'kg',
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
  });

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://granja-production.up.railway.app${url}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadAPI.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.url }));
      alert('Imagen subida correctamente');
    } catch (error) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
      // Limpiar el input para poder subir la misma imagen de nuevo
      e.target.value = '';
    }
  };

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
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
              >
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
            <label>Imagen del Producto</label>
            <div className="image-upload-container">
              {formData.image_url ? (
                <div className="image-preview">
                  <img src={getImageUrl(formData.image_url)} alt="Preview" />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span>Subiendo...</span>
                  ) : (
                    <>
                      <Image size={24} />
                      <span>Click para subir imagen</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.image_url}
              onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="URL de imagen (se completa al subir)"
              className="image-url-input"
            />
          </div>
          <div className="form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              />
              Producto Destacado
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />
              Activo
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
