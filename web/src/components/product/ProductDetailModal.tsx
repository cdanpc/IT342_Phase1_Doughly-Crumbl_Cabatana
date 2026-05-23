import type { Product } from '../../shared/types';
import { formatPrice } from '../../shared/utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ProductImage from './ProductImage';
import QuantitySelector from './QuantitySelector';
import FavoriteButton from './FavoriteButton';
import './ProductDetailModal.css';

interface ProductDetailModalProps {
  product: Product | null;
  quantity: number;
  isAdding: boolean;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onClose: () => void;
}

function categoryLabel(category?: string) {
  if (!category) return 'Cookies';
  return category.toLowerCase().split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

export default function ProductDetailModal({
  product,
  quantity,
  isAdding,
  onQuantityChange,
  onAddToCart,
  onClose,
}: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title="Cookie details"
      description="Review the flavor, quantity, and availability before adding it to your order."
      maxWidth={920}
      preventClose={isAdding}
      className="product-detail-modal"
    >
      <div className="product-detail-modal__content">
        <div className="product-detail-modal__image-wrap">
          <ProductImage src={product.imageUrl} alt={product.name} className="product-detail-modal__image" />
          <FavoriteButton productId={product.id} size={20} className="product-detail-modal__fav" />
        </div>

        <div className="product-detail-modal__body">
          <div className="product-detail-modal__top-row">
            <Badge tone="primary">{categoryLabel(product.category)}</Badge>
          </div>

          <h3 className="product-detail-modal__name">{product.name}</h3>

          <p className="product-detail-modal__desc">
            {product.description || 'Freshly baked Doughly Crumbl treat.'}
          </p>

          <div className="product-detail-modal__details">
            <span>
              <small>Price</small>
              <strong className="product-detail-modal__price">{formatPrice(product.price)}</strong>
            </span>
            <span>
              <small>Availability</small>
              <strong className={product.available ? 'product-detail-modal__avail--yes' : 'product-detail-modal__avail--no'}>
                {product.available ? 'Available today' : 'Unavailable'}
              </strong>
            </span>
          </div>

          <div className="product-detail-modal__footer">
            <QuantitySelector value={quantity} onChange={onQuantityChange} />
            <Button onClick={onAddToCart} isLoading={isAdding} disabled={!product.available}>
              Add {quantity} to cart - {formatPrice(product.price * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
