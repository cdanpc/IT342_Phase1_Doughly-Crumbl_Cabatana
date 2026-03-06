import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { formatPrice } from '../../utils/formatters';
import { ROUTES } from '../../utils/routes';
import './OrderPanel.css';

const DELIVERY_FEE = 80;

export default function OrderPanel() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem } = useCart();

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <ShoppingBag size={20} />
        Order
      </div>

      {items.length === 0 ? (
        <div className="order-panel__empty">
          <span className="order-panel__empty-icon">🍪</span>
          <span className="order-panel__empty-title">Your cart is empty</span>
          <span className="order-panel__empty-text">
            Browse our menu and add something delicious!
          </span>
          <button className="order-panel__browse-btn" onClick={() => navigate(ROUTES.MENU)}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="order-panel__items">
            {items.map((item) => (
              <div className="order-panel__item" key={item.cartItemId}>
                <img
                  className="order-panel__item-image"
                  src={item.productImageUrl || '/placeholder-cookie.png'}
                  alt={item.productName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/f0f0f0/999?text=🍪';
                  }}
                />
                <div className="order-panel__item-info">
                  <span className="order-panel__item-name">{item.productName}</span>
                  <span className="order-panel__item-category">Cookies</span>
                  <div className="order-panel__item-controls">
                    <button
                      className="order-panel__qty-btn"
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.cartItemId, item.quantity - 1)
                          : removeItem(item.cartItemId)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span className="order-panel__qty-value">{item.quantity}</span>
                    <button
                      className="order-panel__qty-btn"
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                    <span className="order-panel__item-price">{formatPrice(item.subtotal)}</span>
                  </div>
                </div>
                <button className="order-panel__item-delete" onClick={() => removeItem(item.cartItemId)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="order-panel__summary">
            <div className="order-panel__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="order-panel__summary-row">
              <span>Delivery fee</span>
              <span>{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <hr className="order-panel__summary-divider" />
            <div className="order-panel__summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button className="order-panel__confirm-btn" onClick={() => navigate(ROUTES.CHECKOUT)}>
            Confirm Order
          </button>
        </>
      )}
    </aside>
  );
}
