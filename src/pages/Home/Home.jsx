import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Truck, Leaf, Heart, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import SplitText from '../../components/SplitText/SplitText';
import './Home.css';
import heroVegetables from '../../assets/hero-vegetables.jpg';
import GlobeCanvas from '../../components/GlobeCanvas/GlobeCanvas';
import Antigravity from '../../components/Antigravity/Antigravity';

export default function Home() {
  const { products } = useApp();
  const featuredProducts = products.slice(0, 4);
  const heroRef = useRef(null);
  const actionsRef = useRef(null);
  const statsRef = useRef(null);
  const globeRef = useRef(null);
  const [showGlobe, setShowGlobe] = useState(false);

  const handleTitleComplete = () => {
    setTimeout(() => setShowGlobe(true), 100);
  };

  const handleDescComplete = () => {
    if (actionsRef.current) actionsRef.current.style.opacity = '1';
    if (statsRef.current) statsRef.current.style.opacity = '1';
  };

  const features = [
    { icon: <Leaf size={28} />, title: '100% Orgánico', description: 'Todos nuestros productos son cultivados sin pesticidas químicos.' },
    { icon: <Truck size={28} />, title: 'Entrega Fresca', description: 'Recibe tus productos el mismo día de la cosecha.' },
    { icon: <Heart size={28} />, title: 'Calidad Premium', description: 'Seleccionamos los mejores productos para ti y tu familia.' },
    { icon: <Award size={28} />, title: 'Certificaciones', description: 'Productos certificados y garantizados por entidades agrícolas.' }
  ];

  return (
    <main className="home">
      <section className="hero hero-antigravity" ref={heroRef}>
        <div className="hero-antigravity-bg">
          <Antigravity
            count={320}
            magnetRadius={12}
            ringRadius={8}
            waveSpeed={0.5}
            waveAmplitude={1.2}
            particleSize={1.6}
            lerpSpeed={0.06}
            color="#4ade80"
            autoAnimate
            particleVariance={1}
            rotationSpeed={0.05}
            depthFactor={1}
            pulseSpeed={2.5}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-line hero-line-1" />
        <div className="hero-line hero-line-2" />

        <div className="hero-inner container">
          <div className="hero-text">

            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <SplitText
                text="Directo del campo a tu mesa"
                tag="span"
                splitType="chars"
                delay={22}
                duration={0.6}
                ease="power2.out"
                from={{ opacity: 0, y: 18 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="left"
              />
            </div>

            {/* Title */}
            <h1 className="hero-title">
              <SplitText
                text="Manjares"
                tag="span"
                className="hero-title-top"
                splitType="chars"
                delay={60}
                duration={1.2}
                ease="power3.out"
                from={{ opacity: 0, y: 80 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="left"
              />
              <SplitText
                text="del Campo"
                tag="span"
                className="hero-title-bottom"
                splitType="chars"
                delay={55}
                duration={1.2}
                ease="power3.out"
                from={{ opacity: 0, y: 80 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="left"
                onLetterAnimationComplete={handleTitleComplete}
              />
            </h1>

            {/* Description */}
            <div className="hero-desc">
              <SplitText
                text="Sabores auténticos, cultivados con pasión y respeto por la tierra. Porque lo natural siempre es mejor."
                tag="p"
                splitType="words"
                delay={28}
                duration={0.85}
                ease="power2.out"
                from={{ opacity: 0, y: 24 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="left"
                onLetterAnimationComplete={handleDescComplete}
              />
            </div>

            <div
              ref={actionsRef}
              className="hero-actions"
              style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
            >
              <Link to="/productos" className="hero-btn-primary">
                Explorar productos <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <Link to="/nosotros" className="hero-btn-ghost">Nuestra historia</Link>
            </div>

            <div
              ref={statsRef}
              className="hero-stats"
              style={{ opacity: 0, transition: 'opacity 0.8s ease 0.25s' }}
            >
              <div className="hero-stat"><span className="stat-num">15+</span><span className="stat-label">Años de experiencia</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="stat-num">100%</span><span className="stat-label">Orgánico certificado</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="stat-num">500+</span><span className="stat-label">Familias satisfechas</span></div>
            </div>
          </div>

          <div
            ref={globeRef}
            className="hero-globe"
            style={{
              opacity: showGlobe ? 1 : 0,
              transform: showGlobe ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
              transition: 'opacity 1s ease, transform 1s ease',
            }}
          >
            <GlobeCanvas size={560} />
          </div>
        </div>

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
