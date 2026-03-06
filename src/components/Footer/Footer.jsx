import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-column">
            <Link to="/" className="footer-logo">
              <Leaf className="footer-logo-icon" />
              <span className="footer-logo-text">GranjaVerde</span>
            </Link>
            <p className="footer-description">
              Productos frescos directamente del campo a tu mesa. 
              Comprometidos con la agricultura sostenible y orgánica.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h4 className="footer-title">Enlaces Rápidos</h4>
            <nav className="footer-nav">
              <Link to="/" className="footer-link">Inicio</Link>
              <Link to="/productos" className="footer-link">Productos</Link>
              <Link to="/nosotros" className="footer-link">Nosotros</Link>
              <Link to="/contacto" className="footer-link">Contacto</Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="footer-column">
            <h4 className="footer-title">Contáctanos</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={18} className="contact-icon" />
                <span>Vereda El Carmen, Funza</span>
              </div>
              <div className="contact-item">
                <Phone size={18} className="contact-icon" />
                <span>+57 300 123 4567</span>
              </div>
              <div className="contact-item">
                <Mail size={18} className="contact-icon" />
                <span>info@granjaverde.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Login Button */}
        <div className="footer-admin">
          <Link to="/admin/login" className="admin-login-button">
            <Leaf size={18} />
            <span>Ingreso Administrador</span>
          </Link>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 GranjaVerde. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
