import './ProductSkeleton.css';

export function ProductSkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-tag shimmer" />
        <div className="skeleton-title shimmer" />
        <div className="skeleton-desc shimmer" />
        <div className="skeleton-desc short shimmer" />
        <div className="skeleton-footer">
          <div className="skeleton-price shimmer" />
          <div className="skeleton-btn shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeletonCard key={i} />
      ))}
    </div>
  );
}
