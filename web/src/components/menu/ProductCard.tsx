import type { Product } from '../../shared/types';
import { formatPrice } from '../../shared/utils/formatters';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import ProductImage from '../product/ProductImage';
import AddToCartButton from './AddToCartButton';
import FavoriteButton from '../product/FavoriteButton';
import './MenuComponents.css';

interface ProductCardProps {
  product: Product;
  isAdding: boolean;
  onAddToCart: (event: React.MouseEvent<HTMLButtonElement>, product: Product) => void;
  onOpen: (product: Product) => void;
}

function getBadge(product: Product) {
  if (product.category === 'BEST_SELLERS') return 'Best Seller';
  if (product.category === 'SEASONAL') return 'Seasonal';
  if (product.category === 'SPECIALTY') return 'Specialty';
  return '';
}

export default function ProductCard({ product, isAdding, onAddToCart, onOpen }: ProductCardProps) {
  const badge = getBadge(product);

  return (
    <Card interactive className="menu-product-card" onClick={() => onOpen(product)}>
      <div className="menu-product-card__image-wrap">
        <ProductImage src={product.imageUrl} alt={product.name} className="menu-product-card__image" />
        <FavoriteButton productId={product.id} size={16} className="menu-product-card__fav" />
        {badge && <Badge tone="primary" className="menu-product-card__badge">{badge}</Badge>}
        {!product.available && <Badge tone="danger" className="menu-product-card__availability">Unavailable</Badge>}
      </div>
      <div className="menu-product-card__body">
        <h3>{product.name}</h3>
        <p>{product.description || 'Freshly baked Doughly Crumbl treat.'}</p>
        <div className="menu-product-card__footer">
          <strong>{formatPrice(product.price)}</strong>
          <AddToCartButton
            isLoading={isAdding}
            onClick={(event) => onAddToCart(event, product)}
          />
        </div>
      </div>
    </Card>
  );
}
