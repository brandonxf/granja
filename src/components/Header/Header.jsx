import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Header.css';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useApp();
  const location = useLocation();
  const indicatorRef = useRef(null);
  const navRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/productos', label: 'Productos' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeLink = navRef.current.querySelector('.nav-link-active');
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      indicatorRef.current.style.left = `${offsetLeft}px`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
      indicatorRef.current.style.opacity = '1';
    } else {
      indicatorRef.current.style.opacity = '0';
    }
  }, [location.pathname]);

  const isCartPage = location.pathname === '/carrito';

  return (
    <>
      <header className={`header ${scrolled ? 'header-scrolled' : ''} ${isCartPage ? 'header-dark' : ''}`}>
        <div className="header-inner">

          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C16 4 6 10 6 19C6 24.5 10.5 28 16 28C21.5 28 26 24.5 26 19C26 10 16 4 16 4Z" fill="currentColor" opacity="0.9"/>
                <path d="M16 28V16M16 16C16 16 11 12 9 9M16 16C16 16 21 12 23 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="logo-text-wrap">
              <span className="logo-name">Manjares</span>
              <span className="logo-sub">del Campo</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav" ref={navRef}>
            <div className="nav-indicator" ref={indicatorRef} />
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive(path) ? 'nav-link-active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <Link to="/carrito" className="cart-btn" aria-label="Ver carrito">
              <ShoppingCart size={20} strokeWidth={1.8} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>


            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-inner">
          <div className="drawer-logo">
            <span>Manjares del Campo</span>
          </div>
          <nav className="drawer-nav">
            {navLinks.map(({ path, label }, i) => (
              <Link
                key={path}
                to={path}
                className={`drawer-link ${isActive(path) ? 'drawer-link-active' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="drawer-link-num">0{i + 1}</span>
                {label}
              </Link>
            ))}
          </nav>
          <Link to="/carrito" className="drawer-cart" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={18} />
            Carrito {cartCount > 0 && <span className="drawer-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
      {mobileMenuOpen && <div className="drawer-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </>
  );
}
