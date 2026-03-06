import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useApp();

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
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-image"
                />
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
            <button className="checkout-btn">
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
