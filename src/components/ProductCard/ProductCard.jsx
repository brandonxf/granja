import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Sparkles, Image, Leaf, X, Plus, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, products } = useApp();
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

  const related = (products || [])
    .filter(p => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 3);

  const openModal = (e) => {
    e?.stopPropagation();
    setQty(1);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleAddFromModal = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    closeModal();
  };

  const modal = modalOpen && createPortal(
    <div className="product-modal-overlay" onClick={closeModal}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="product-modal-close" onClick={closeModal}>
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
                <span className="meta-value in-stock">Organico</span>
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

          {/* Related products */}
          {related.length > 0 && (
            <div className="modal-related">
              <p className="modal-related-title">Productos relacionados</p>
              <div className="modal-related-grid">
                {related.map(p => {
                  const relImg = getImageUrl(p.image_url);
                  return (
                    <button key={p.id} className="modal-related-card" onClick={() => {
                      closeModal();
                      setTimeout(() => {
                        const el = document.getElementById(`product-${p.id}`);
                        el?.click();
                      }, 150);
                    }}>
                      <div className="modal-related-img">
                        {relImg
                          ? <img src={relImg} alt={p.name} />
                          : <Image size={20} opacity={0.2} />}
                      </div>
                      <div className="modal-related-info">
                        <span className="modal-related-name">{p.name}</span>
                        <span className="modal-related-price">{formatPrice(p.price)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div
        id={`product-${product.id}`}
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

      {modal}
    </>
  );
}
