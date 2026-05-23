import { Minus, Plus, Trash2 } from 'lucide-react';
import ProductImage from '../product/ProductImage';
import type { CartItem } from '../../shared/types';
import { formatPrice } from '../../shared/utils/formatters';

interface CartItemRowProps {
  item: CartItem;
  isPending: boolean;
  onDecrease: (cartItemId: number, quantity: number) => void;
  onIncrease: (cartItemId: number, quantity: number) => void;
  onRemove: (cartItemId: number) => void;
}

export default function CartItemRow({
  item,
  isPending,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="order-panel__item">
      <ProductImage src={item.productImageUrl} alt={item.productName} className="order-panel__item-image" />
      <div className="order-panel__item-info">
        <span className="order-panel__item-name">{item.productName}</span>
        <span className="order-panel__item-category">Cookie</span>
        <div className="order-panel__item-controls">
          <button
            className="order-panel__qty-btn"
            onClick={() => onDecrease(item.cartItemId, item.quantity)}
            disabled={isPending}
            aria-label={`Decrease ${item.productName} quantity`}
          >
            <Minus size={14} />
          </button>
          <span className="order-panel__qty-value">{item.quantity}</span>
          <button
            className="order-panel__qty-btn"
            onClick={() => onIncrease(item.cartItemId, item.quantity)}
            disabled={isPending}
            aria-label={`Increase ${item.productName} quantity`}
          >
            <Plus size={14} />
          </button>
          <span className="order-panel__item-price">{formatPrice(item.subtotal)}</span>
        </div>
      </div>
      <button
        className="order-panel__item-delete"
        onClick={() => onRemove(item.cartItemId)}
        disabled={isPending}
        aria-label={`Remove ${item.productName}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
