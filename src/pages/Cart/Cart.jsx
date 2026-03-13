import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ordersAPI } from '../../api/client';
import './Cart.css';

const PHONE = '573154143417';
const SITE_URL = 'https://granja-nu.vercel.app';

function buildWhatsAppOrder(cart, total, orderId) {
  const formatPrice = (p) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(p);

  const lines = cart.map(item =>
    `- ${item.quantity}x ${item.name}: ${formatPrice(item.price * item.quantity)}`
  ).join('\n');

  const trackingLine = orderId ? `\nSeguimiento: ${SITE_URL}/pedido/${orderId}` : '';
  return `Hola! Quiero realizar un pedido:\n\n*Mi pedido:*\n${lines}\n\n*Total: ${formatPrice(total)}*${trackingLine}\n\nMe pueden confirmar disponibilidad y coordinar la entrega?`;
}

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useApp();
  const [checkingOut, setCheckingOut] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingCart size={64} className="empty-cart-icon" />
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algunos productos frescos de nuestra granja</p>
            <Link to="/productos" className="back-to-shop">
              Ver Productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="cart-header">
          <Link to="/productos" className="back-link">
            <ArrowLeft size={18} />
            <span>Seguir Comprando</span>
          </Link>
          <h1 className="cart-title">Mi Carrito</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                {item.image_url ? (
                  <img 
                    src={getImageUrl(item.image_url)} 
                    alt={item.name} 
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-item-image-placeholder">
                    <Image size={24} />
                  </div>
                )}
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="summary-title">Resumen del Pedido</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button className="checkout-btn" disabled={checkingOut} onClick={async () => {
              setCheckingOut(true);
              let orderId = null;
              try {
                const result = await ordersAPI.create({
                  customer_name: 'Cliente WhatsApp',
                  items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.price * item.quantity
                  })),
                  total: cartTotal
                });
                orderId = result.order_id;
              } catch (e) { /* si falla el guardado, igual abre WhatsApp */ }
              const msg = buildWhatsAppOrder(cart, cartTotal, orderId);
              window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
              setCheckingOut(false);
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{flexShrink:0}}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Proceder al Pago
            </button>
            <button className="clear-cart-btn" onClick={clearCart}>
              Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
