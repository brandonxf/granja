import { useState } from 'react';
import { ShoppingCart, Sparkles, Image, Leaf, X, Plus, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [qty, setQty] = useState(1);

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(price);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return null;
  };

  const imageUrl = getImageUrl(product.image_url);

  const handleAddFromModal = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setModalOpen(false);
    setQty(1);
  };

  const openModal = (e) => {
    e.stopPropagation();
    setQty(1);
    setModalOpen(true);
  };

  return (
    <>
      <div
        className="product-card fade-in"
        style={{ animationDelay: `${index * 0.07}s` }}
        onClick={openModal}
      >
        <div className="product-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="product-image" loading="lazy" />
          ) : (
            <div className="product-image-placeholder"><Image size={52} /></div>
          )}
          {product.featured && (
            <span className="product-badge">
              <Sparkles size={10} /> Destacado
            </span>
          )}
        </div>

        <div className="product-content">
          {product.category_name && (
            <span className="product-category">
              <Leaf size={10} /> {product.category_name}
            </span>
          )}
          <h3 className="product-name">{product.name}</h3>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          <div className="product-footer">
            <div className="product-price-container">
              <span className="product-price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <button
              className="add-to-cart-button"
              onClick={(e) => { e.stopPropagation(); openModal(e); }}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="product-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="product-modal-close" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="product-modal-image">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} />
              ) : (
                <div className="product-modal-placeholder"><Image size={64} /></div>
              )}
              {product.featured && (
                <span className="product-badge">
                  <Sparkles size={10} /> Destacado
                </span>
              )}
            </div>

            <div className="product-modal-body">
              {product.category_name && (
                <span className="product-category">
                  <Leaf size={10} /> {product.category_name}
                </span>
              )}
              <h2 className="product-modal-name">{product.name}</h2>

              {product.description && (
                <p className="product-modal-desc">{product.description}</p>
              )}

              <div className="product-modal-meta">
                {product.stock != null && (
                  <div className="product-meta-item">
                    <span className="meta-label">Disponibilidad</span>
                    <span className={`meta-value ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                    </span>
                  </div>
                )}
                {product.unit && (
                  <div className="product-meta-item">
                    <span className="meta-label">Unidad</span>
                    <span className="meta-value">{product.unit}</span>
                  </div>
                )}
                {product.organic && (
                  <div className="product-meta-item">
                    <span className="meta-label">Tipo</span>
                    <span className="meta-value in-stock">🌿 Orgánico</span>
                  </div>
                )}
              </div>

              <div className="product-modal-footer">
                <span className="product-modal-price">{formatPrice(product.price)}</span>

                <div className="product-modal-actions">
                  <div className="qty-control">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)}><Plus size={14} /></button>
                  </div>
                  <button className="modal-add-btn" onClick={handleAddFromModal}>
                    <ShoppingCart size={16} />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
