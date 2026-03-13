import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../../api/client';
import { Package, Truck, CheckCircle, Clock, XCircle, Home, MessageCircle } from 'lucide-react';
import './OrderTracking.css';

const PHONE = '573154143417';

const STEPS = [
  { key: 'pendiente',  label: 'Pedido recibido', icon: Clock,        desc: 'Hemos recibido tu pedido y lo estamos revisando.' },
  { key: 'confirmado', label: 'Confirmado',        icon: Package,      desc: 'Tu pedido fue confirmado y está siendo preparado.' },
  { key: 'en_camino',  label: 'En camino',         icon: Truck,        desc: 'Tu pedido está en camino hacia ti.' },
  { key: 'entregado',  label: 'Entregado',         icon: CheckCircle,  desc: '¡Tu pedido fue entregado exitosamente!' },
];

const STATUS_INDEX = { pendiente: 0, confirmado: 1, en_camino: 2, entregado: 3 };

const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`;

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState(id || '');
  const [searched, setSearched] = useState(!!id);

  const fetchOrder = async (orderId) => {
    if (!orderId) return;
    setLoading(true); setError(null);
    try {
      const data = await ordersAPI.getById(orderId);
      setOrder(data);
    } catch (e) {
      setError('No encontramos un pedido con ese número. Verifica el ID e inténtalo de nuevo.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrder(id); else setLoading(false); }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    fetchOrder(searchId.trim());
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? 0) : 0;
  const isCancelled = order?.status === 'cancelado';

  const waMsg = encodeURIComponent(`Hola! Quiero consultar el estado de mi pedido #${order?.id}`);

  return (
    <main className="tracking-page">
      <div className="tracking-hero">
        <div className="container">
          <h1 className="tracking-title">Seguimiento de Pedido</h1>
          <p className="tracking-subtitle">Ingresa el número de tu pedido para ver el estado</p>
        </div>
      </div>

      <div className="tracking-content container">
        {/* Search */}
        <div className="tracking-search-card">
          <form className="tracking-search-form" onSubmit={handleSearch}>
            <div className="tracking-search-input-wrap">
              <span className="tracking-search-prefix">#</span>
              <input
                type="number"
                className="tracking-search-input"
                placeholder="Número de pedido"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                required
                min="1"
              />
            </div>
            <button type="submit" className="tracking-search-btn">Consultar</button>
          </form>
          <p className="tracking-hint">El número de pedido lo encuentras en el mensaje de WhatsApp que recibiste.</p>
        </div>

        {loading && searched && (
          <div className="tracking-loading">
            <div className="tracking-spinner" />
            <p>Buscando tu pedido...</p>
          </div>
        )}

        {error && (
          <div className="tracking-error">
            <XCircle size={40} />
            <p>{error}</p>
          </div>
        )}

        {order && !loading && (
          <div className="tracking-result">

            {/* Order header */}
            <div className="tracking-order-header">
              <div>
                <span className="tracking-order-num">Pedido #{order.id}</span>
                <span className={`tracking-status-badge status-${order.status || 'pendiente'}`}>
                  {isCancelled ? 'Cancelado' : STEPS[currentStep]?.label}
                </span>
              </div>
              <div className="tracking-order-meta">
                <span>{order.customer_name || 'Cliente'}</span>
                {order.created_at && (
                  <span>{new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                )}
              </div>
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div className="tracking-stepper">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step.key} className={`tracking-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      <div className="step-icon-wrap">
                        <div className="step-icon"><Icon size={20} /></div>
                        {i < STEPS.length - 1 && <div className={`step-line ${done ? 'done' : ''}`} />}
                      </div>
                      <div className="step-info">
                        <span className="step-label">{step.label}</span>
                        {active && <span className="step-desc">{step.desc}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="tracking-cancelled">
                <XCircle size={32} />
                <p>Este pedido fue cancelado. Contáctanos si tienes dudas.</p>
              </div>
            )}

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="tracking-items">
                <h3>Productos del pedido</h3>
                <div className="tracking-items-list">
                  {order.items.map((item, i) => (
                    <div className="tracking-item" key={i}>
                      <span className="tracking-item-name">{item.product_name || item.name || `Producto`}</span>
                      <span className="tracking-item-qty">x{item.quantity}</span>
                      <span className="tracking-item-price">{fmt(item.subtotal || item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="tracking-item tracking-total">
                    <span>Total</span>
                    <span></span>
                    <span className="tracking-total-value">{fmt(order.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="tracking-actions">
              <a href={`https://wa.me/${PHONE}?text=${waMsg}`} target="_blank" rel="noreferrer" className="tracking-wa-btn">
                <MessageCircle size={18} /> Consultar por WhatsApp
              </a>
              <Link to="/productos" className="tracking-home-btn">
                <Home size={18} /> Ver productos
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
