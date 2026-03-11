import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  LogOut, Plus, Edit, Trash2, Users, DollarSign, Image
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uploadAPI } from '../../api/client';
import './AdminDashboard.css';

const API_URL = 'https://granja-production.up.railway.app';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return '';
};

export default function AdminDashboard() {
  const { admin, logoutAdmin, products, orders, addProduct, updateProduct, deleteProduct } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!admin) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => { logoutAdmin(); navigate('/'); };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Productos' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
    { id: 'stats', icon: BarChart3, label: 'Estadísticas' },
  ];

  const totalProducts = products.length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { icon: Package,    label: 'Total Productos',    value: totalProducts,  color: 'rgba(126,200,122,0.15)', iconColor: '#7ec87a' },
    { icon: ShoppingCart, label: 'Pedidos Pendientes', value: pendingOrders, color: 'rgba(251,191,36,0.15)',  iconColor: '#fbbf24' },
    { icon: DollarSign, label: 'Ingresos del Mes',   value: `$${(totalRevenue/1000).toFixed(0)}K`, color: 'rgba(99,179,237,0.15)', iconColor: '#63b3ed' },
    { icon: Users,      label: 'Clientes',            value: '—',            color: 'rgba(196,181,253,0.15)', iconColor: '#c4b5fd' },
  ];

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) deleteProduct(id);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Manjares del Campo</div>
          <span className="sidebar-badge">Panel Admin</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-admin-avatar">A</div>
          <div>
            <div className="sidebar-admin-name">Administrador</div>
            <div className="sidebar-admin-role">admin@manjaresdelcampo.com</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">

        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div>
                <h1 className="admin-page-title">Dashboard</h1>
                <p className="admin-page-sub">Bienvenido al panel de administración</p>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map(({ icon: Icon, label, value, color, iconColor }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon" style={{ background: color }}>
                    <Icon size={20} color={iconColor} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value" style={{ color: iconColor }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card">
              <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Productos Recientes
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Producto','Categoría','Precio','Stock'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0,5).map(p => (
                    <tr key={p.id}>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)', textTransform: 'capitalize' }}>{p.category_name || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#7ec87a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>${parseFloat(p.price).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {activeSection === 'products' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div>
                <h1 className="admin-page-title">Productos</h1>
                <p className="admin-page-sub">{products.length} productos en total</p>
              </div>
              <button className="add-product-btn" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                <Plus size={16} /> Agregar Producto
              </button>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        {product.image_url ? (
                          <img src={getImageUrl(product.image_url)} alt={product.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb-placeholder"><Image size={18} /></div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td className="capitalize">{product.category_name || 'Sin categoría'}</td>
                      <td style={{ color: '#7ec87a' }}>${parseFloat(product.price).toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit-btn" onClick={() => { setEditingProduct(product); setShowProductForm(true); }}>
                            <Edit size={15} />
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 size={15} />
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

        {/* Orders */}
        {activeSection === 'orders' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div>
                <h1 className="admin-page-title">Pedidos</h1>
                <p className="admin-page-sub">{orders.length} pedidos registrados</p>
              </div>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: 'rgba(255,255,255,0.4)' }}>#{order.id}</td>
                      <td>{order.client}</td>
                      <td style={{ color: 'rgba(255,255,255,0.4)' }}>{order.date}</td>
                      <td style={{ color: '#7ec87a' }}>${order.total.toLocaleString()}</td>
                      <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {activeSection === 'stats' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div>
                <h1 className="admin-page-title">Estadísticas</h1>
                <p className="admin-page-sub">Métricas y análisis detallados</p>
              </div>
            </div>
            <div className="stats-placeholder">
              <BarChart3 size={56} />
              <h3>Próximamente</h3>
              <p>Las estadísticas detalladas estarán disponibles pronto</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSave={(productData) => {
            if (editingProduct) updateProduct(editingProduct.id, productData);
            else addProduct(productData);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadAPI.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.url }));
    } catch (error) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Imagen del Producto</label>
            <div className="image-upload-container">
              {formData.image_url ? (
                <div className="image-preview">
                  <img src={getImageUrl(formData.image_url)} alt="Preview" />
                  <button type="button" className="remove-image" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>×</button>
                </div>
              ) : (
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  <Image size={22} />
                  <span>{uploading ? 'Subiendo...' : 'Click para subir imagen'}</span>
                </div>
              )}
            </div>
            <input type="text" value={formData.image_url} onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))} placeholder="URL de imagen" className="image-url-input" />
          </div>
          <div className="form-checkboxes">
            <label><input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} /> Destacado</label>
            <label><input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} /> Activo</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="save-btn">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
