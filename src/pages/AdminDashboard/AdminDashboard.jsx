import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  LogOut, Plus, Edit, Trash2, Users, DollarSign, Image,
  TrendingUp, Clock, CheckCircle, XCircle, Eye
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { uploadAPI, ordersAPI } from '../../api/client';
import './AdminDashboard.css';
import logoImg from '../../assets/logo.png';

const API_URL = 'https://granja-production.up.railway.app';
const GREEN = '#2D5A27'; const LIGHT = '#7ec87a'; const GOLD = '#f59e0b';
const COLORS = [GREEN, LIGHT, GOLD, '#4A7C43', '#a3e635', '#86efac'];

const getImageUrl = (url) => { if (!url) return ''; if (url.startsWith('http')) return url; return ''; };
const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`;

const STATUS_LABELS = { pendiente: 'Pendiente', confirmado: 'Confirmado', en_camino: 'En camino', entregado: 'Entregado', cancelado: 'Cancelado' };
const STATUS_NEXT  = { pendiente: 'confirmado', confirmado: 'en_camino', en_camino: 'entregado' };

export default function AdminDashboard() {
  const { admin, logoutAdmin, products, orders, setOrders, addProduct, updateProduct, deleteProduct } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [realOrders, setRealOrders] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  if (!admin) return <Navigate to="/admin/login" replace />;
  const handleLogout = () => { logoutAdmin(); navigate('/'); };

  // Load real orders from API
  useEffect(() => {
    if (activeSection === 'orders' || activeSection === 'stats' || activeSection === 'dashboard') {
      setLoadingOrders(true);
      ordersAPI.getAll().then(data => {
        const list = Array.isArray(data) ? data : (data.orders || []);
        setRealOrders(list);
      }).catch(() => {}).finally(() => setLoadingOrders(false));
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'stats') {
      ordersAPI.getStats().then(data => setStatsData(data)).catch(() => {});
    }
  }, [activeSection]);

  const allOrders = realOrders.length > 0 ? realOrders : orders;
  const totalRevenue = allOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const pendingCount = allOrders.filter(o => o.status === 'pendiente').length;
  const deliveredCount = allOrders.filter(o => o.status === 'entregado').length;

  // Charts data
  const statusCounts = allOrders.reduce((acc, o) => {
    acc[o.status || 'pendiente'] = (acc[o.status || 'pendiente'] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value }));

  // Revenue by day (last 7 orders grouped)
  const revenueByDay = (() => {
    const map = {};
    allOrders.forEach(o => {
      const d = o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }) : 'Hoy';
      map[d] = (map[d] || 0) + (parseFloat(o.total) || 0);
    });
    return Object.entries(map).slice(-7).map(([date, total]) => ({ date, total }));
  })();

  // Top products by frequency in orders
  const productFreq = {};
  allOrders.forEach(o => {
    (o.items || []).forEach(item => {
      const name = item.product_name || item.name || `Producto ${item.product_id}`;
      productFreq[name] = (productFreq[name] || 0) + (item.quantity || 1);
    });
  });
  const topProducts = Object.entries(productFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, qty }));

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setRealOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { alert('Error al actualizar estado'); }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products',  icon: Package,         label: 'Productos' },
    { id: 'orders',    icon: ShoppingCart,     label: 'Pedidos' },
    { id: 'stats',     icon: BarChart3,        label: 'Estadísticas' },
  ];

  const kpis = [
    { icon: Package,      label: 'Total Productos',  value: products.length,              bg: 'rgba(45,90,39,0.1)',    iconColor: GREEN },
    { icon: ShoppingCart, label: 'Pedidos Pendientes', value: pendingCount,               bg: 'rgba(245,158,11,0.12)', iconColor: '#92690a' },
    { icon: DollarSign,   label: 'Ingresos Totales',  value: fmt(totalRevenue),           bg: 'rgba(45,90,39,0.08)',   iconColor: GREEN },
    { icon: CheckCircle,  label: 'Entregados',         value: deliveredCount,             bg: 'rgba(126,200,122,0.15)',iconColor: '#2a7a2a' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="Manjares del Campo" className="sidebar-logo-img" />
          <span className="sidebar-badge">Panel Admin</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button key={id} className={`sidebar-item ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id)}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-admin-avatar">A</div>
          <div className="sidebar-admin-info">
            <div className="sidebar-admin-name">Administrador</div>
            <div className="sidebar-admin-role">admin@manjaresdelcampo.com</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión"><LogOut size={15} /></button>
        </div>
      </aside>

      <main className="admin-main">

        {/* ── Dashboard ── */}
        {activeSection === 'dashboard' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div><h1 className="admin-page-title">Dashboard</h1><p className="admin-page-sub">Resumen general del negocio</p></div>
            </div>
            <div className="stats-grid">
              {kpis.map(({ icon: Icon, label, value, bg, iconColor }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={iconColor} /></div>
                  <div className="stat-info"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
                </div>
              ))}
            </div>

            {/* Mini revenue chart */}
            {revenueByDay.length > 0 && (
              <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <p className="dashboard-table-title">Ingresos recientes</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={revenueByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,90,39,0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => [fmt(v), 'Ingresos']} />
                    <Line type="monotone" dataKey="total" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="glass-card">
              <p className="dashboard-table-title">Últimos pedidos</p>
              {allOrders.length === 0 ? <p className="dashboard-empty">No hay pedidos aún.</p> : (
                <table>
                  <thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody>
                    {allOrders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td style={{ color: 'rgba(45,90,39,0.5)' }}>#{o.id}</td>
                        <td style={{ color: '#5D4037' }}>{o.customer_name || o.client || '—'}</td>
                        <td style={{ color: GREEN, fontWeight: 600 }}>{fmt(o.total)}</td>
                        <td><span className={`status-badge status-${o.status || 'pendiente'}`}>{STATUS_LABELS[o.status] || o.status || 'Pendiente'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {activeSection === 'products' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div><h1 className="admin-page-title">Productos</h1><p className="admin-page-sub">{products.length} productos en total</p></div>
              <button className="add-product-btn" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}><Plus size={16} /> Agregar Producto</button>
            </div>
            <div className="products-table">
              <table>
                <thead><tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.image_url ? <img src={getImageUrl(product.image_url)} alt={product.name} className="product-thumb" /> : <div className="product-thumb-placeholder"><Image size={18} /></div>}</td>
                      <td>{product.name}</td>
                      <td className="capitalize">{product.category_name || 'Sin categoría'}</td>
                      <td style={{ color: '#7ec87a' }}>${parseFloat(product.price).toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit-btn" onClick={() => { setEditingProduct(product); setShowProductForm(true); }}><Edit size={15} /></button>
                          <button className="action-btn delete-btn" onClick={() => { if (window.confirm('¿Eliminar este producto?')) deleteProduct(product.id); }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {activeSection === 'orders' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div><h1 className="admin-page-title">Pedidos</h1><p className="admin-page-sub">{allOrders.length} pedidos registrados</p></div>
            </div>
            {loadingOrders ? <p className="dashboard-empty">Cargando pedidos...</p> : (
              <div className="orders-table">
                <table>
                  <thead><tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Items</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    {allOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ color: 'rgba(45,90,39,0.5)' }}>#{order.id}</td>
                        <td>{order.customer_name || order.client || '—'}</td>
                        <td style={{ color: 'rgba(45,90,39,0.5)', fontSize: '0.8rem' }}>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-CO') : order.date || '—'}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#5D4037' }}>
                          {(order.items || []).map(i => `${i.product_name || i.name || 'Producto'} x${i.quantity}`).join(', ') || '—'}
                        </td>
                        <td style={{ color: GREEN, fontWeight: 600 }}>{fmt(order.total)}</td>
                        <td><span className={`status-badge status-${order.status || 'pendiente'}`}>{STATUS_LABELS[order.status] || 'Pendiente'}</span></td>
                        <td>
                          {STATUS_NEXT[order.status] && (
                            <button className="action-btn edit-btn" style={{ fontSize: '0.7rem', padding: '4px 8px', width: 'auto', borderRadius: '6px' }}
                              onClick={() => handleUpdateStatus(order.id, STATUS_NEXT[order.status])}>
                              → {STATUS_LABELS[STATUS_NEXT[order.status]]}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Stats ── */}
        {activeSection === 'stats' && (
          <div className="admin-section">
            <div className="section-header-admin">
              <div><h1 className="admin-page-title">Estadísticas</h1><p className="admin-page-sub">Análisis y métricas del negocio</p></div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              {kpis.map(({ icon: Icon, label, value, bg, iconColor }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={iconColor} /></div>
                  <div className="stat-info"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              {/* Revenue over time */}
              <div className="glass-card chart-card">
                <p className="dashboard-table-title">Ingresos por día</p>
                {revenueByDay.length === 0 ? <p className="dashboard-empty">Sin datos aún</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,90,39,0.08)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v) => [fmt(v), 'Ingresos']} />
                      <Bar dataKey="total" fill={GREEN} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Orders by status */}
              <div className="glass-card chart-card">
                <p className="dashboard-table-title">Pedidos por estado</p>
                {pieData.length === 0 ? <p className="dashboard-empty">Sin datos aún</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top products */}
              <div className="glass-card chart-card chart-card-wide">
                <p className="dashboard-table-title">Productos más pedidos</p>
                {topProducts.length === 0 ? <p className="dashboard-empty">Sin datos aún</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,90,39,0.08)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5D4037' }} width={110} />
                      <Tooltip />
                      <Bar dataKey="qty" fill={LIGHT} radius={[0, 4, 4, 0]} name="Unidades" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSave={(productData) => {
            if (editingProduct) updateProduct(editingProduct.id, productData);
            else addProduct(productData);
            setShowProductForm(false); setEditingProduct(null);
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
    name: product?.name || '', description: product?.description || '',
    price: product?.price || 0, category_id: product?.category_id || 1,
    stock: product?.stock || 0, image_url: product?.image_url || '',
    unit: product?.unit || 'kg', featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { setUploading(true); const result = await uploadAPI.uploadImage(file); setFormData(prev => ({ ...prev, image_url: result.url })); }
    catch (error) { alert('Error al subir imagen: ' + error.message); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="product-form">
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Categoría</label>
              <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}>
                {categories.filter(c => c.id !== 'all').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Descripción</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
          <div className="form-row">
            <div className="form-group"><label>Precio</label><input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required /></div>
            <div className="form-group"><label>Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required /></div>
          </div>
          <div className="form-group">
            <label>Imagen del Producto</label>
            <div className="image-upload-container">
              {formData.image_url ? (
                <div className="image-preview"><img src={getImageUrl(formData.image_url)} alt="Preview" /><button type="button" className="remove-image" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>×</button></div>
              ) : (
                <div className="image-upload-box"><input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} /><Image size={22} /><span>{uploading ? 'Subiendo...' : 'Click para subir imagen'}</span></div>
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
