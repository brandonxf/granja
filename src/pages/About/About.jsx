import { Leaf, Heart, TreePine, MapPin } from 'lucide-react';
import GlobeCanvas from '../../components/GlobeCanvas/GlobeCanvas';
import './About.css';
import aboutFarm from '../../assets/about-farm.jpg';

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1 className="about-title">Nuestra Historia</h1>
          <p className="about-subtitle">
            Tres generaciones cultivando con amor y respeto por la tierra
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Manjares del Campo: Tradición y Sostenibilidad</h2>
              <p>
                Fundada en 1985 por nuestros abuelos, Manjares del Campo ha sido durante 
                décadas un símbolo de agricultura sostenible en nuestra región. 
                Lo que comenzó como una pequeña granja familiar hoy es un compromiso 
                con la calidad y el cuidado del medio ambiente.
              </p>
              <p>
                Creemos firmemente que los mejores productos vienen de la tierra 
                cultivada con respeto. Por eso, todas nuestras frutas, verduras y 
                productos lácteos son 100% orgánicos, libres de pesticidas y químicos.
              </p>
              <p>
                Cada producto que llega a tu mesa ha sido seleccionado con cuidado, 
                cosechado en su punto óptimo y entregado fresco a tu hogar.
              </p>
            </div>
            <div className="about-image">
              <img src={aboutFarm} alt="Nuestra granja" />
            </div>
          </div>

          <div className="values-section">
            <h2 className="values-title">Nuestros Valores</h2>
            <div className="values-grid">
              <div className="value-card">
                <Leaf className="value-icon" />
                <h3>Sostenibilidad</h3>
                <p>Cuidadosamente cultivados para preservar la tierra para las futuras generaciones.</p>
              </div>
              <div className="value-card">
                <Heart className="value-icon" />
                <h3>Calidad</h3>
                <p>Solo los mejores productos llegan a nuestra mesa y a la tuya.</p>
              </div>
              <div className="value-card">
                <TreePine className="value-icon" />
                <h3>Tradición</h3>
                <p>Métodos ancestrales combinados con las mejores prácticas modernas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dónde estamos ── */}
      <section className="location-section">
        <div className="container">
          <div className="location-header">
            <MapPin className="location-pin-icon" />
            <h2 className="location-title">¿Dónde estamos?</h2>
            <p className="location-subtitle">
              Estamos ubicados en Dibulla, La Guajira, Colombia — en el corazón de una de las regiones más fértiles del Caribe colombiano.
            </p>
          </div>

          <div className="location-grid">
            <div className="location-info">
              <div className="location-detail">
                <span className="location-label">Región</span>
                <span className="location-value">La Guajira, Colombia</span>
              </div>
              <div className="location-detail">
                <span className="location-label">Municipio</span>
                <span className="location-value">Dibulla</span>
              </div>
              <div className="location-detail">
                <span className="location-label">Zona</span>
                <span className="location-value">Costa Caribe Colombiana</span>
              </div>
              <div className="location-detail">
                <span className="location-label">Clima</span>
                <span className="location-value">Tropical, ideal para cultivos orgánicos</span>
              </div>
              <p className="location-desc">
                Nuestra granja se beneficia del clima cálido y húmedo del Caribe, los suelos ricos en minerales 
                de la Sierra Nevada de Santa Marta y las aguas limpias de los ríos de La Guajira. 
                Estas condiciones únicas son las que le dan a nuestros productos su sabor inigualable.
              </p>
            </div>

            <div className="location-globe">
              <GlobeCanvas size={460} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
