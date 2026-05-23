import type { Product } from '../../shared/types';
import EmptyState from '../ui/EmptyState';
import ProductCard from './ProductCard';
import './MenuComponents.css';

interface ProductGridProps {
  products: Product[];
  addingId: number | null;
  isLoading?: boolean;
  onAddToCart: (event: React.MouseEvent<HTMLButtonElement>, product: Product) => void;
  onOpenProduct: (product: Product) => void;
}

function ProductCardSkeleton() {
  return (
    <div className="menu-product-card menu-product-card--skeleton" aria-hidden="true">
      <div className="menu-product-card__image-wrap skeleton menu-product-card__skeleton-image" />
      <div className="menu-product-card__body">
        <div className="menu-product-card__skeleton-row">
          <span className="skeleton menu-product-card__skeleton-pill" />
          <span className="skeleton menu-product-card__skeleton-chip" />
        </div>
        <span className="skeleton menu-product-card__skeleton-title" />
        <span className="skeleton menu-product-card__skeleton-text" />
        <span className="skeleton menu-product-card__skeleton-text menu-product-card__skeleton-text--short" />
        <div className="menu-product-card__footer">
          <span className="skeleton menu-product-card__skeleton-price" />
          <span className="skeleton menu-product-card__skeleton-button" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, addingId, isLoading = false, onAddToCart, onOpenProduct }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="menu-product-grid" aria-label="Loading products">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No cookies found"
        message="Try another search term or category to find your next box."
      />
    );
  }

  return (
    <div className="menu-product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isAdding={addingId === product.id}
          onAddToCart={onAddToCart}
          onOpen={onOpenProduct}
        />
      ))}
    </div>
  );
}
