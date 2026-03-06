import { Leaf, Heart, TreePine } from 'lucide-react';
import './About.css';

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
              <h2>GranjaVerde: Tradición y Sostenibilidad</h2>
              <p>
                Fundada en 1985 por nuestros abuelos, GranjaVerde ha sido durante 
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
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop" 
                alt="Nuestra granja"
              />
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
    </main>
  );
}
