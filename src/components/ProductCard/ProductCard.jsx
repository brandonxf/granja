import { ShoppingCart, Tag, Sparkles, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

const API_URL = 'https://granja-production.up.railway.app';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useApp();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div 
      className="product-card fade-in" 
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <Image size={48} />
          </div>
        )}
        {product.featured && (
          <span className="product-badge product-badge-new">
            <Sparkles size={12} />
            Destacado
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
