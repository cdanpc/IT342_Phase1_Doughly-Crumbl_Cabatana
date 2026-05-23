import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CartItemRow from '../components/cart/CartItemRow';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useCart } from '../shared/hooks/CartContext';
import { formatPrice } from '../shared/utils/formatters';
import { ROUTES } from '../shared/utils/routes';
import './OrderPanel.css';

export default function OrderPanel() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, openCheckout, closeOrderPanel } = useCart();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;

  async function handleDecrease(cartItemId: number, quantity: number) {
    if (pendingItemId !== null) return;
    setPendingItemId(cartItemId);
    try {
      if (quantity > 1) await updateQuantity(cartItemId, quantity - 1);
      else await removeItem(cartItemId);
    } catch {
      toast.error('Failed to update cart. Please try again.');
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleIncrease(cartItemId: number, quantity: number) {
    if (pendingItemId !== null) return;
    setPendingItemId(cartItemId);
    try {
      await updateQuantity(cartItemId, quantity + 1);
    } catch {
      toast.error('Failed to update cart. Please try again.');
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleRemove(cartItemId: number) {
    if (pendingItemId !== null) return;
    setPendingItemId(cartItemId);
    try {
      await removeItem(cartItemId);
    } catch {
      toast.error('Failed to remove item. Please try again.');
    } finally {
      setPendingItemId(null);
    }
  }

  function handleBrowseMenu() {
    closeOrderPanel();
    navigate(ROUTES.MENU);
  }

  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <span className="order-panel__header-icon"><ShoppingBag size={20} /></span>
        <div>
          <h2>Order Bag</h2>
          <p>{items.length} item{items.length === 1 ? '' : 's'} selected</p>
        </div>
        <button
          className="order-panel__close-btn"
          onClick={closeOrderPanel}
          aria-label="Close order bag"
        >
          <X size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="order-panel__empty">
          <EmptyState
            title="Your bag is empty"
            message="Browse the menu and add something freshly baked before checkout."
            actionLabel="Browse menu"
            onAction={handleBrowseMenu}
            icon={<ShoppingBag size={30} />}
          />
          <p className="order-panel__empty-note">
            You can open or close this bag anytime while browsing.
          </p>
        </div>
      ) : (
        <>
          <div className="order-panel__items">
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                isPending={pendingItemId === item.cartItemId}
                onDecrease={handleDecrease}
                onIncrease={handleIncrease}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="order-panel__summary">
            <div className="order-panel__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="order-panel__summary-row">
              <span>Delivery fee</span>
              <span>Quoted after order</span>
            </div>
            <hr className="order-panel__summary-divider" />
            <div className="order-panel__summary-total">
              <span>Total today</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <p className="order-panel__policy-note">
            Delivery fee is calculated based on your location and confirmed before payment.
          </p>

          <Button className="order-panel__confirm-btn" onClick={openCheckout} fullWidth>
            Proceed to checkout <ArrowRight size={18} />
          </Button>
        </>
      )}
    </aside>
  );
}
