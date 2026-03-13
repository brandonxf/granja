import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Header.css';
import logoImg from '../../assets/logo.png';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useApp();
  const location = useLocation();
  const indicatorRef = useRef(null);
  const navRef = useRef(null);
  const isFirstRender = useRef(true);

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

  const updateIndicator = () => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeLink = navRef.current.querySelector('.nav-link-active');
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      if (isFirstRender.current) {
        indicatorRef.current.classList.add('no-transition');
        isFirstRender.current = false;
      } else {
        indicatorRef.current.classList.remove('no-transition');
      }
      indicatorRef.current.style.left = `${offsetLeft}px`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
      indicatorRef.current.style.opacity = '1';
    } else {
      indicatorRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    // Double RAF ensures DOM is fully painted before measuring
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        updateIndicator();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [location.pathname]);

  const isCartPage = location.pathname === '/carrito';

  return (
    <>
      <header className={`header ${scrolled ? 'header-scrolled' : ''} ${isCartPage ? 'header-dark' : ''}`}>
        <div className="header-inner">

          {/* Logo */}
          <Link to="/" className="logo">
            <img src={logoImg} alt="Manjares del Campo" className="logo-img" />
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
            <img src={logoImg} alt="Manjares del Campo" className="drawer-logo-img" />
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
