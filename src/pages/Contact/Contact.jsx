import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Contact.css';

export default function Contact() {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1 className="contact-title">Contáctanos</h1>
          <p className="contact-subtitle">
            Estamos aquí para ayudarte. Escríbenos y te responderemos pronto.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Información de Contacto</h2>
              <p className="contact-info-text">
                Puedes visitarnos en nuestra granja, llamarnos o escribirnos. 
                Será un placer atenderte.
              </p>
              
              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3>Dirección</h3>
                    <p>Vereda El Carmen, Funza<br/>Cundinamarca, Colombia</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3>Teléfono</h3>
                    <p>+57 300 123 4567</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3>Email</h3>
                    <p>info@granjaverde.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Envíanos un Mensaje</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Mensaje</label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">
                  <Send size={18} />
                  <span>Enviar Mensaje</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
