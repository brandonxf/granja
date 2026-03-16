import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  LogOut, Plus, Edit, Trash2, Users, DollarSign, Image,
  TrendingUp, Clock, CheckCircle, XCircle, Eye, Menu, X, UserCircle, Tag
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import AdminUsers from '../AdminUsers/AdminUsers';
import AdminProfile from '../AdminProfile/AdminProfile';
import { uploadAPI, ordersAPI, productsAPI } from '../../api/client';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderModal, setOrderModal] = useState(null); // { type: "cancel"|"delete", order }
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

  const handleUpdateStatus = async (orderId, newStatus, cancelReason) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus, cancelReason);
      setRealOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, cancel_reason: cancelReason } : o));
    } catch (e) { alert('Error al actualizar estado'); }
  };

  const handleDeleteOrder = async (orderId, reason) => {
    try {
      await ordersAPI.deleteOrder(orderId, reason);
      setRealOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) { alert('Error al eliminar pedido'); }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products',  icon: Package,         label: 'Productos' },
    { id: 'categories',icon: Tag,             label: 'Categorías' },
    { id: 'orders',    icon: ShoppingCart,     label: 'Pedidos' },
    { id: 'stats',     icon: BarChart3,        label: 'Estadísticas' },
    { id: 'users',     icon: Users,            label: 'Usuarios' },
    { id: 'profile',   icon: UserCircle,       label: 'Mi Perfil' },
  ];

  const kpis = [
    { icon: Package,      label: 'Total Productos',  value: products.length,              bg: 'rgba(45,90,39,0.1)',    iconColor: GREEN },
    { icon: ShoppingCart, label: 'Pedidos Pendientes', value: pendingCount,               bg: 'rgba(245,158,11,0.12)', iconColor: '#92690a' },
    { icon: DollarSign,   label: 'Ingresos Totales',  value: fmt(totalRevenue),           bg: 'rgba(45,90,39,0.08)',   iconColor: GREEN },
    { icon: CheckCircle,  label: 'Entregados',         value: deliveredCount,             bg: 'rgba(126,200,122,0.15)',iconColor: '#2a7a2a' },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile close button */}
        <button className="sidebar-close-btn" onClick={closeSidebar}><X size={20} /></button>
        <div className="sidebar-header">
          <img src={logoImg} alt="Manjares del Campo" className="sidebar-logo-img" />
          <span className="sidebar-badge">Panel Admin</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button key={id} className={`sidebar-item ${activeSection === id ? 'active' : ''}`} onClick={() => { setActiveSection(id); closeSidebar(); }}>
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
        {/* Mobile topbar */}
        <div className="admin-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <span className="admin-topbar-title">Panel Admin</span>
        </div>

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

        {/* ── Categories ── */}
        {activeSection === 'categories' && (
          <AdminCategories />
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
                          <div className="action-buttons" style={{flexWrap:'wrap',gap:'4px'}}>
                            {STATUS_NEXT[order.status] && (
                              <button className="action-btn edit-btn" style={{ fontSize: '0.7rem', padding: '4px 8px', width: 'auto', borderRadius: '6px', whiteSpace:'nowrap' }}
                                onClick={() => handleUpdateStatus(order.id, STATUS_NEXT[order.status])}>
                                → {STATUS_LABELS[STATUS_NEXT[order.status]]}
                              </button>
                            )}
                            {order.status !== 'cancelado' && order.status !== 'entregado' && (
                              <button className="action-btn" style={{ fontSize: '0.7rem', padding: '4px 8px', width: 'auto', borderRadius: '6px', background:'rgba(245,158,11,0.1)', color:'#92690a', border:'1px solid rgba(245,158,11,0.3)', whiteSpace:'nowrap' }}
                                onClick={() => setOrderModal({ type: 'cancel', order })}>
                                ✕ Cancelar
                              </button>
                            )}
                            <button className="action-btn delete-btn" style={{ fontSize: '0.7rem', padding: '4px 8px', width: 'auto', borderRadius: '6px', whiteSpace:'nowrap' }}
                              onClick={() => setOrderModal({ type: 'delete', order })}>
                              🗑 Eliminar
                            </button>
                          </div>
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
        {/* ── Users ── */}
        {activeSection === 'users' && <AdminUsers currentAdmin={admin} />}

        {/* ── Profile ── */}
        {activeSection === 'profile' && <AdminProfile />}

      </main>

      {orderModal && (
        <OrderActionModal
          type={orderModal.type}
          order={orderModal.order}
          onClose={() => setOrderModal(null)}
          onConfirm={(reason) => {
            if (orderModal.type === 'cancel') {
              handleUpdateStatus(orderModal.order.id, 'cancelado', reason);
            } else {
              handleDeleteOrder(orderModal.order.id, reason);
            }
            setOrderModal(null);
          }}
        />
      )}

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

function OrderActionModal({ type, order, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const isCancel = type === 'cancel';
  const title   = isCancel ? `Cancelar pedido #${order.id}` : `Eliminar pedido #${order.id}`;
  const label   = isCancel ? 'Motivo de cancelación' : 'Motivo de eliminación';
  const btnText = isCancel ? 'Cancelar pedido' : 'Eliminar pedido';
  const btnClass = isCancel ? 'cancel-order-btn' : 'delete-order-btn';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-action-modal" onClick={e => e.stopPropagation()}>
        <div className={`order-modal-header ${isCancel ? 'cancel-header' : 'delete-header'}`}>
          <h2 className="modal-title">{title}</h2>
          <p className="order-modal-sub">
            {isCancel
              ? 'Este pedido será marcado como cancelado. El cliente podrá ver el motivo.'
              : 'Esta acción es irreversible. El pedido será eliminado permanentemente.'}
          </p>
        </div>

        <div className="order-modal-body">
          <div className="order-modal-info">
            <span>Cliente:</span> <strong>{order.customer_name || '—'}</strong>
            <span>Total:</span>   <strong>{`$${Number(order.total).toLocaleString('es-CO')}`}</strong>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>{label} <span style={{ color: '#e53e3e' }}>*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={isCancel ? 'Ej: Producto sin stock, cliente solicitó cancelación...' : 'Ej: Pedido duplicado, prueba del sistema...'}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>Volver</button>
          <button
            type="button"
            className={btnClass}
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ADMIN CATEGORIES COMPONENT
═══════════════════════════════════════ */
function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // {type:'create'|'edit'|'delete', cat?}
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    productsAPI.getCategories()
      .then(data => setCats(Array.isArray(data) ? data : []))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (cat) => {
    try {
      const updated = await productsAPI.toggleCategory(cat.id);
      setCats(prev => prev.map(c => c.id === cat.id ? { ...c, active: updated.active } : c));
    } catch (e) { alert(e.message || 'Error al cambiar estado'); }
  };

  const handleDelete = async (cat) => {
    try {
      await productsAPI.deleteCategory(cat.id);
      setCats(prev => prev.filter(c => c.id !== cat.id));
      setModal(null);
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) {
        const updated = await productsAPI.updateCategory(id, formData);
        setCats(prev => prev.map(c => c.id === id ? updated : c));
      } else {
        const created = await productsAPI.createCategory(formData);
        setCats(prev => [...prev, created]);
      }
      setModal(null);
    } catch (e) {
      throw e;
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header-admin">
        <div>
          <h1 className="admin-page-title">Categorías</h1>
          <p className="admin-page-sub">{cats.length} categorías registradas</p>
        </div>
        <button className="add-product-btn" onClick={() => setModal({ type: 'create' })}>
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <p className="dashboard-empty">Cargando categorías...</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th style={{width:'35%'}}>Nombre</th>
                <th style={{width:'40%'}}>Descripción</th>
                <th style={{width:'12%'}}>Estado</th>
                <th style={{width:'13%'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(cat => (
                <tr key={cat.id} style={{ opacity: cat.active === false ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600, color: '#2D5A27' }}>{cat.name}</td>
                  <td style={{ color: '#888', fontSize: '0.88rem' }}>{cat.description || '—'}</td>
                  <td>
                    <span className={`status-badge ${cat.active === false ? 'status-cancelado' : 'status-entregado'}`}>
                      {cat.active === false ? 'Inactiva' : 'Activa'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" title="Editar"
                        onClick={() => setModal({ type: 'edit', cat })}>
                        <Edit size={15} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title={cat.active === false ? 'Activar' : 'Desactivar'}
                        style={{ color: cat.active === false ? '#2D5A27' : '#f59e0b' }}
                        onClick={() => handleToggle(cat)}>
                        {cat.active === false ? <CheckCircle size={15} /> : <XCircle size={15} />}
                      </button>
                      <button className="action-btn delete-btn" title="Eliminar"
                        onClick={() => { setError(''); setModal({ type: 'delete', cat }); }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <CatFormModal
          cat={modal.cat}
          onClose={() => setModal(null)}
          onSave={(data) => handleSave(data, modal.cat?.id)}
        />
      )}

      {/* Modal eliminar */}
      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ color: '#c53030' }}>Eliminar categoría</h2>
            <p style={{ color: '#555', margin: '0.5rem 0 1.25rem', fontSize: '0.95rem' }}>
              ¿Eliminar <strong>{modal.cat.name}</strong>? Esta acción no se puede deshacer.
            </p>
            {error && (
              <div style={{ background: '#fff5f5', color: '#c53030', padding: '0.65rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #fed7d7' }}>
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="save-btn" style={{ background: '#c53030' }}
                onClick={() => handleDelete(modal.cat)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CatFormModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState({ name: cat?.name || '', description: cat?.description || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await onSave(form); }
    catch (err) { setError(err.message || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{cat ? 'Editar categoría' : 'Nueva categoría'}</h2>
        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', padding: '0.65rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #fed7d7' }}>
            {error}
          </div>
        )}
        <form className="product-form" onSubmit={handle}>
          <div className="form-group">
            <label>Nombre <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
