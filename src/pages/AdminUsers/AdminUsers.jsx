import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Shield, User } from 'lucide-react';
import { adminsAPI } from '../../api/client';
import './AdminUsers.css';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin' };

export default function AdminUsers({ currentAdmin }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // {type: 'view'|'create'|'edit'|'delete', user?}

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  useEffect(() => {
    adminsAPI.getAll()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (formData) => {
    const created = await adminsAPI.create(formData);
    setUsers(prev => [...prev, created]);
    setModal(null);
  };

  const handleUpdate = async (id, formData) => {
    const updated = await adminsAPI.update(id, formData);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    setModal(null);
  };

  const handleDelete = async (id, reason) => {
    await adminsAPI.delete(id, reason);
    setUsers(prev => prev.filter(u => u.id !== id));
    setModal(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header-admin">
        <div>
          <h1 className="admin-page-title">Usuarios</h1>
          <p className="admin-page-sub">{users.length} administradores registrados</p>
        </div>
        {isSuperAdmin && (
          <button className="add-product-btn" onClick={() => setModal({ type: 'create' })}>
            <Plus size={16} /> Crear usuario
          </button>
        )}
      </div>

      {loading ? (
        <p className="dashboard-empty">Cargando usuarios...</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.last_name || '—'}</td>
                  <td style={{ color: '#888', fontSize: '0.88rem' }}>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'super_admin' ? <Shield size={12} /> : <User size={12} />}
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" title="Ver" onClick={() => setModal({ type: 'view', user })}>
                        <Eye size={15} />
                      </button>
                      {isSuperAdmin && (
                        <>
                          <button className="action-btn edit-btn" title="Editar" onClick={() => setModal({ type: 'edit', user })}>
                            <Edit size={15} />
                          </button>
                          <button className="action-btn delete-btn" title="Eliminar" onClick={() => setModal({ type: 'delete', user })}>
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.type === 'view'   && <UserViewModal   user={modal.user}  onClose={() => setModal(null)} />}
      {modal?.type === 'create' && <UserFormModal   onClose={() => setModal(null)} onSave={handleCreate} />}
      {modal?.type === 'edit'   && <UserFormModal   user={modal.user}  onClose={() => setModal(null)} onSave={(d) => handleUpdate(modal.user.id, d)} />}
      {modal?.type === 'delete' && <UserDeleteModal user={modal.user}  onClose={() => setModal(null)} onConfirm={(r) => handleDelete(modal.user.id, r)} />}
    </div>
  );
}

/* ── View Modal ── */
function UserViewModal({ user, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
        <div className="user-modal-header">
          <div className="user-avatar-lg">{(user.name || 'A')[0].toUpperCase()}</div>
          <div>
            <h2 className="modal-title">{user.name} {user.last_name}</h2>
            <span className={`role-badge role-${user.role}`}>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        <div className="user-modal-body">
          <div className="user-info-grid">
            <InfoRow label="Nombre"    value={user.name} />
            <InfoRow label="Apellido"  value={user.last_name || '—'} />
            <InfoRow label="Email"     value={user.email} />
            <InfoRow label="Teléfono"  value={user.phone || '—'} />
            <InfoRow label="Rol"       value={ROLE_LABELS[user.role] || user.role} />
            <InfoRow label="Registrado" value={user.created_at ? new Date(user.created_at).toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }) : '—'} />
          </div>
        </div>
        <div className="modal-actions"><button className="save-btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

/* ── Create / Edit Modal ── */
function UserFormModal({ user, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '', last_name: user?.last_name || '',
    email: user?.email || '', phone: user?.phone || '',
    role: user?.role || 'admin', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password?.trim()) delete payload.password;
      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? 'Editar usuario' : 'Crear usuario'}</h2>
        {error && <div className="user-form-error">{error}</div>}
        <form className="product-form" onSubmit={handle}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre <span className="req">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email <span className="req">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rol <span className="req">*</span></label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>{isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!isEdit} placeholder={isEdit ? 'Dejar vacío para no cambiar' : ''} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Modal ── */
function UserDeleteModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!reason.trim()) return;
    setLoading(true); setError('');
    try { await onConfirm(reason.trim()); }
    catch (err) { setError(err.message || 'Error al eliminar'); setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
        <div className="order-modal-header delete-header" style={{padding:'1.5rem 1.75rem 1.25rem', margin:'-0px'}}>
          <h2 className="modal-title" style={{color:'#c53030'}}>Eliminar usuario</h2>
          <p className="order-modal-sub">Esta acción es irreversible.</p>
        </div>
        <div style={{padding:'1.25rem 1.75rem'}}>
          <div className="order-modal-info" style={{marginBottom:'1rem'}}>
            <span>Usuario:</span><strong>{user.name} {user.last_name}</strong>
            <span>Email:</span><strong>{user.email}</strong>
          </div>
          {error && <div className="user-form-error">{error}</div>}
          <div className="form-group">
            <label>Motivo de eliminación <span className="req">*</span></label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ingresa el motivo..." style={{resize:'vertical'}} />
          </div>
        </div>
        <div className="modal-actions" style={{borderTop:'1px solid #f0f0f0', padding:'1rem 1.75rem 1.5rem'}}>
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="delete-order-btn" disabled={!reason.trim() || loading} onClick={handle}>
            {loading ? 'Eliminando...' : 'Eliminar usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}
