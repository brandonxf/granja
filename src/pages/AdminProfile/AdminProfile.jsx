import { useState, useEffect } from 'react';
import { Edit, Shield, User, Mail, Phone, Calendar, Lock } from 'lucide-react';
import { adminsAPI } from '../../api/client';
import { useApp } from '../../context/AppContext';
import './AdminProfile.css';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin' };

export default function AdminProfile() {
  const { admin, setAdmin } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    adminsAPI.getMe()
      .then(data => setProfile(data))
      .catch(() => setProfile(admin))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (formData) => {
    const updated = await adminsAPI.updateMe(formData);
    setProfile(updated);
    // Update context name
    setAdmin(prev => ({ ...prev, name: updated.name, last_name: updated.last_name, email: updated.email, phone: updated.phone }));
    setShowEdit(false);
  };

  if (loading) return <div className="admin-section"><p className="dashboard-empty">Cargando perfil...</p></div>;

  const p = profile || admin;

  return (
    <div className="admin-section">
      <div className="section-header-admin">
        <div>
          <h1 className="admin-page-title">Mi Perfil</h1>
          <p className="admin-page-sub">Información de tu cuenta</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{(p?.name || 'A')[0].toUpperCase()}</div>
          <div className="profile-header-info">
            <h2 className="profile-name">{p?.name} {p?.last_name}</h2>
            <span className={`role-badge role-${p?.role}`}>
              {p?.role === 'super_admin' ? <Shield size={13} /> : <User size={13} />}
              {ROLE_LABELS[p?.role] || p?.role}
            </span>
          </div>
          <button className="add-product-btn profile-edit-btn" onClick={() => setShowEdit(true)}>
            <Edit size={16} /> Editar perfil
          </button>
        </div>

        <div className="profile-body">
          <div className="profile-info-grid">
            <ProfileField icon={<User size={18} />}     label="Nombre"       value={`${p?.name || ''} ${p?.last_name || ''}`} />
            <ProfileField icon={<Mail size={18} />}     label="Email"        value={p?.email} />
            <ProfileField icon={<Phone size={18} />}    label="Teléfono"     value={p?.phone || 'No registrado'} />
            <ProfileField icon={<Shield size={18} />}   label="Rol"          value={ROLE_LABELS[p?.role] || p?.role} />
            <ProfileField icon={<Calendar size={18} />} label="Miembro desde" value={p?.created_at ? new Date(p.created_at).toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }) : '—'} />
          </div>
        </div>
      </div>

      {showEdit && (
        <ProfileEditModal
          profile={p}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="profile-field">
      <div className="profile-field-icon">{icon}</div>
      <div>
        <div className="profile-field-label">{label}</div>
        <div className="profile-field-value">{value}</div>
      </div>
    </div>
  );
}

function ProfileEditModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || '', last_name: profile?.last_name || '',
    email: profile?.email || '', phone: profile?.phone || '',
    password: '', confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password && form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden'); return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, last_name: form.last_name, email: form.email, phone: form.phone };
      if (form.password?.trim()) payload.password = form.password;
      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title" style={{padding:'1.5rem 1.75rem 0'}}>Editar perfil</h2>
        {error && <div className="user-form-error" style={{margin:'0.75rem 1.75rem 0'}}>{error}</div>}
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

          <div className="password-section">
            <div className="password-section-title"><Lock size={15} /> Cambiar contraseña (opcional)</div>
            <div className="form-row">
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Dejar vacío para no cambiar" />
              </div>
              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} placeholder="Repetir nueva contraseña" />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
