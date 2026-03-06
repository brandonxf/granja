import { useState } from 'react';
import { Apple, Carrot, Milk, Egg, Beef, Sprout, Grid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const iconMap = {
  Apple,
  Carrot,
  Milk,
  Egg,
  Beef,
  Sprout,
  Grid
};

export default function Products() {
  const { products, categories } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <main className="products-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Nuestros Productos</h1>
          <p className="page-subtitle">
            Explora nuestra variedad de productos frescos y orgánicos
          </p>
        </div>

        <div className="categories-filter">
          {categories.map(({ id, name, icon }) => {
            const IconComponent = iconMap[icon];
            return (
              <button
                key={id}
                className={`category-button ${activeCategory === id ? 'category-active' : ''}`}
                onClick={() => setActiveCategory(id)}
              >
                <IconComponent size={20} />
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
