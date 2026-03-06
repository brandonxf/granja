import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Leaf, Heart, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

export default function Home() {
  const { products } = useApp();
  const featuredProducts = products.slice(0, 4);

  const features = [
    {
      icon: <Leaf size={32} />,
      title: '100% Orgánico',
      description: 'Todos nuestros productos son cultivados sin pesticidas químicos.'
    },
    {
      icon: <Truck size={32} />,
      title: 'Entrega Fresca',
      description: 'Recibe tus productos el mismo día de la cosecha.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Calidad Premium',
      description: 'Seleccionamos los mejores productos para ti y tu familia.'
    },
    {
      icon: <Award size={32} />,
      title: 'Certificaciones',
      description: 'Productos certificados y garantizados por entidades agrícolas.'
    }
  ];

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content container">
          <span className="hero-badge fade-in">🌱 Fresh from the Farm</span>
          <h1 className="hero-title fade-in" style={{ animationDelay: '0.1s' }}>
            Productos Frescos<br />
            <span>Directo del Campo</span>
          </h1>
          <p className="hero-description fade-in" style={{ animationDelay: '0.2s' }}>
            Descubre la diferencia de comer productos frescos y naturales. 
            Cultivados con amor en nuestra granja sostenible.
          </p>
          <div className="hero-actions fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/productos" className="hero-button-primary">
              Ver Productos
              <ArrowRight size={20} />
            </Link>
            <Link to="/nosotros" className="hero-button-secondary">
              Conócenos
            </Link>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Productos Destacados</h2>
            <p className="section-subtitle">
              Los favoritos de nuestros clientes
            </p>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/productos" className="view-all-button">
              Ver Todos los Productos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">¿Tienes una granja?</h2>
              <p className="cta-description">
                ¿Quieres ofrecer tus productos en GranjaVerde? 
                Contáctanos y únete a nuestra comunidad de agricultores sostenibles.
              </p>
              <Link to="/contacto" className="cta-button">
                Contáctanos
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="cta-decoration">
              <Leaf className="cta-leaf cta-leaf-1" />
              <Leaf className="cta-leaf cta-leaf-2" />
              <Leaf className="cta-leaf cta-leaf-3" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
