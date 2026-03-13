import { useState, useMemo } from 'react';
import { Apple, Carrot, Milk, Egg, Beef, Sprout, Grid, Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const iconMap = { Apple, Carrot, Milk, Egg, Beef, Sprout, Grid };

export default function Products() {
  const { products, categories } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  const maxPrice = useMemo(() =>
    products.length ? Math.max(...products.map(p => Number(p.price))) : 100000
  , [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Category
    if (activeCategory !== 'all')
      list = list.filter(p => p.category_id?.toString() === activeCategory);

    // Search
    if (search.trim())
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );

    // Price range
    list = list.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);

    // Sort
    if (sortBy === 'price-asc')  list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'name-asc')   list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc')  list.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'newest')     list.sort((a, b) => b.id - a.id);

    return list;
  }, [products, activeCategory, search, sortBy, priceRange]);

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(p);

  const clearFilters = () => {
    setSearch('');
    setSortBy('default');
    setPriceRange([0, maxPrice]);
    setActiveCategory('all');
  };

  const hasFilters = search || sortBy !== 'default' || activeCategory !== 'all' || priceRange[1] < maxPrice;

  return (
    <main className="products-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Nuestros Productos</h1>
          <p className="page-subtitle">Explora nuestra variedad de productos frescos y orgánicos</p>

          {/* Search bar */}
          <div className="products-search-wrap">
            <div className="products-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container products-content">

        {/* Controls row */}
        <div className="products-controls">
          {/* Categories */}
          <div className="categories-filter">
            {categories.map(({ id, name, icon }) => {
              const IconComponent = iconMap[icon];
              return (
                <button
                  key={id}
                  className={`category-button ${activeCategory === id ? 'category-active' : ''}`}
                  onClick={() => setActiveCategory(id)}
                >
                  {IconComponent && <IconComponent size={16} />}
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="products-right-controls">
            {/* Sort */}
            <div className="sort-wrap">
              <ArrowUpDown size={15} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="default">Ordenar</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>

            {/* Filters toggle */}
            <button className={`filters-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={15} />
              Filtros
            </button>

            {/* Clear */}
            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={14} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Price filter panel */}
        {showFilters && (
          <div className="price-filter-panel">
            <div className="price-filter-header">
              <span className="price-filter-label">Rango de precio</span>
              <span className="price-filter-values">{formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}</span>
            </div>
            <div className="price-slider-wrap">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={500}
                value={priceRange[0]}
                onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 500), priceRange[1]])}
                className="price-slider"
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={500}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 500)])}
                className="price-slider"
              />
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="products-results-info">
          <span>{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
          {hasFilters && <span className="results-filtered"> · filtrado</span>}
        </div>

        {filtered.length === 0 ? (
          <div className="no-products">
            <Search size={40} opacity={0.2} />
            <p>No se encontraron productos</p>
            <button className="clear-filters-btn" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
