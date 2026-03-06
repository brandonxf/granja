import { ShoppingCart, Tag, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useApp();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      className="product-card fade-in" 
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {product.isNew && (
          <span className="product-badge product-badge-new">
            <Sparkles size={12} />
            Nuevo
          </span>
        )}
        {product.isOffer && (
          <span className="product-badge product-badge-offer">
            <Tag size={12} />
            Oferta
          </span>
        )}
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-price-container">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="product-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <button 
          className="add-to-cart-button"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart size={18} />
          <span>Agregar al Carrito</span>
        </button>
      </div>
    </div>
  );
}
