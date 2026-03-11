import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Truck, Leaf, Heart, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';
import GlobeCanvas from '../../components/GlobeCanvas/GlobeCanvas';

export default function Home() {
  const { products } = useApp();
  const featuredProducts = products.slice(0, 4);
  const heroRef = useRef(null);
  const spotlight1Ref = useRef(null);
  const spotlight2Ref = useRef(null);

  // Typewriter state
  const lines = [
    { id: 'eyebrow', text: 'Directo del campo a tu mesa', speed: 32 },
    { id: 'title1', text: 'Manjares', speed: 60 },
    { id: 'title2', text: 'del Campo', speed: 55 },
    { id: 'desc', text: 'Sabores auténticos, cultivados con pasión y respeto por la tierra.\nPorque lo natural siempre es mejor.', speed: 18 },
  ];
  const [typed, setTyped] = useState({});
  const [done, setDone] = useState({});

  useEffect(() => {
    let lineIndex = 0;

    const typeNext = () => {
      if (lineIndex >= lines.length) return;
      const { id, text, speed } = lines[lineIndex];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTyped(prev => ({ ...prev, [id]: text.slice(0, i) }));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(prev => ({ ...prev, [id]: true }));
          lineIndex++;
          setTimeout(typeNext, 120); // short pause before next line
        }
      }, speed);
    };

    const startTimeout = setTimeout(typeNext, 300);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (spotlight1Ref.current) {
        spotlight1Ref.current.style.left = `${x}%`;
        spotlight1Ref.current.style.top = `${y}%`;
      }
      if (spotlight2Ref.current) {
        spotlight2Ref.current.style.left = `${100 - x * 0.6}%`;
        spotlight2Ref.current.style.top = `${100 - y * 0.6}%`;
      }
    };

    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: <Leaf size={28} />, title: '100% Orgánico', description: 'Todos nuestros productos son cultivados sin pesticidas químicos.' },
    { icon: <Truck size={28} />, title: 'Entrega Fresca', description: 'Recibe tus productos el mismo día de la cosecha.' },
    { icon: <Heart size={28} />, title: 'Calidad Premium', description: 'Seleccionamos los mejores productos para ti y tu familia.' },
    { icon: <Award size={28} />, title: 'Certificaciones', description: 'Productos certificados y garantizados por entidades agrícolas.' }
  ];

  return (
    <main className="home">

      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-grain" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-line hero-line-1" />
        <div className="hero-line hero-line-2" />
        <div className="cursor-spotlight cursor-spotlight-1" ref={spotlight1Ref} />
        <div className="cursor-spotlight cursor-spotlight-2" ref={spotlight2Ref} />

        <div className="hero-inner container">
          <div className="hero-text">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            <span className={done.eyebrow ? 'done' : ''}>{typed.eyebrow || '\u00a0'}</span>
          </div>
          <h1 className="hero-title">
            <span className={`hero-title-top${done.title1 ? ' done' : ''}`}>{typed.title1 || '\u00a0'}</span>
            <span className={`hero-title-bottom${done.title2 ? ' done' : ''}`}>{typed.title2 || '\u00a0'}</span>
          </h1>
          <p className={`hero-desc${done.desc ? ' done' : ''}`}>
            {(typed.desc || '').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <div className="hero-actions" style={{ opacity: typed.desc && typed.desc.length > 10 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <Link to="/productos" className="hero-btn-primary">
              Explorar productos <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link to="/nosotros" className="hero-btn-ghost">Nuestra historia</Link>
          </div>
          <div className="hero-stats" style={{ opacity: typed.desc && typed.desc.length > 30 ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
            <div className="hero-stat"><span className="stat-num">15+</span><span className="stat-label">Años de experiencia</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="stat-num">100%</span><span className="stat-label">Orgánico certificado</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="stat-num">500+</span><span className="stat-label">Familias satisfechas</span></div>
          </div>
          </div>
          <div className="hero-globe fade-in" style={{ animationDelay: '0.5s' }}>
            <GlobeCanvas size={560} />
          </div>
        </div>{/* hero-inner */}

        <div className="scroll-cue">
          <div className="scroll-track"><div className="scroll-thumb" /></div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-d${i + 1}`}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Lo mejor de la temporada</span>
            <h2 className="section-title">Productos Destacados</h2>
            <p className="section-subtitle">Los favoritos de nuestros clientes</p>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className={`reveal reveal-scale reveal-d${(index % 4) + 1}`}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
          <div className="section-cta reveal">
            <Link to="/productos" className="view-all-btn">
              Ver todos los productos <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card reveal">
            <div className="cta-bg-pattern" />
            <div className="cta-content">
              <span className="cta-tag">Únete a nosotros</span>
              <h2 className="cta-title">¿Tienes una granja?</h2>
              <p className="cta-desc">
                Ofrece tus productos en Manjares del Campo y llega a cientos de familias que valoran lo auténtico.
              </p>
              <Link to="/contacto" className="cta-btn">
                Contáctanos <ArrowRight size={18} />
              </Link>
            </div>
            <div className="cta-visual">
              <div className="cta-circle cta-circle-1" />
              <div className="cta-circle cta-circle-2" />
              <div className="cta-circle cta-circle-3" />
              <Leaf className="cta-leaf-icon cta-leaf-1" size={80} />
              <Leaf className="cta-leaf-icon cta-leaf-2" size={48} />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
