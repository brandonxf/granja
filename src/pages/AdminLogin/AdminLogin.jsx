import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await loginAdmin(email, password);
    setLoading(false);
    
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <main className="login-page">
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate('/')}
        aria-label="Volver al inicio"
      >
        <ArrowLeft size={16} />
        <span className="back-btn-text">Inicio</span>
      </button>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Leaf size={40} />
            </div>
            <h1 className="login-title">Manjares del Campo</h1>
            <p className="login-subtitle">Panel de Administración</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="********"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

          
        </div>

        <div className="login-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
          <div className="decoration-circle decoration-circle-3"></div>
        </div>
      </div>
    </main>
  );
}
