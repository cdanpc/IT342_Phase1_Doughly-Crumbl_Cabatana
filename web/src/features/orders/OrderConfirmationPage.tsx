import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, MapPin, ReceiptText, ShoppingBag } from 'lucide-react';
import { formatDate, formatPrice } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import type { Order } from '../../shared/types';
import './OrderConfirmationPage.css';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  const fulfillmentMethod = (location.state?.fulfillmentMethod as string) ?? 'DELIVERY';
  const isPickup = fulfillmentMethod === 'PICKUP';

  if (!order) {
    return (
      <div className="order-success__fallback">
        <ReceiptText size={36} />
        <h2>Order details unavailable</h2>
        <p>This confirmation page needs a freshly placed order. You can still check My Orders for the latest status.</p>
        <div className="order-success__fallback-actions">
          <button className="order-success__btn-primary" onClick={() => navigate(ROUTES.ORDERS)}>
            Go to My Orders
          </button>
          <button className="order-success__btn-secondary" onClick={() => navigate(ROUTES.MENU)}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const itemsSubtotal = order.subtotalAmount ?? order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const nextStep = isPickup
    ? "We'll prepare your cookies and notify you when they are ready for pickup."
    : 'The seller will quote your delivery fee, then notify you before payment is collected.';

  return (
    <div className="order-success">
      <section className="order-success__hero">
        <div className="order-success__check-wrap">
          <CheckCircle size={42} />
        </div>
        <span className="order-success__eyebrow">Order confirmed</span>
        <h1 className="order-success__title">Order #{order.orderId} is in</h1>
        <p className="order-success__subtitle">{nextStep}</p>
      </section>

      <section className={`order-success__notice ${isPickup ? 'order-success__notice--pickup' : 'order-success__notice--delivery'}`}>
        <Clock size={16} className="order-success__notice-icon" />
        <div>
          <strong>{isPickup ? 'Pickup order placed' : 'Awaiting delivery quote'}</strong>
          <span>
            {isPickup
              ? "We'll update your order when it moves into preparation."
              : 'Delivery fee is not charged yet. Watch My Orders and notifications for the quoted total.'}
          </span>
        </div>
      </section>

      <section className="order-success__card">
        <div className="order-success__card-top">
          <div>
            <div className="order-success__order-id-label">Order number</div>
            <div className="order-success__order-id">#{order.orderId}</div>
          </div>
          <div className="order-success__date">{formatDate(order.orderDate)}</div>
        </div>

        <div className="order-success__route">
          <MapPin size={15} />
          <span>{isPickup ? 'Pickup at Doughly Crumbl' : order.deliveryAddress}</span>
        </div>

        <hr className="order-success__divider" />

        <div className="order-success__items">
          {order.items.map((item) => (
            <div key={`${item.productId ?? item.productName}-${item.quantity}`} className="order-success__item">
              <span className="order-success__item-name">{item.productName}</span>
              <span className="order-success__item-qty">x {item.quantity}</span>
              <span className="order-success__item-price">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <hr className="order-success__divider" />

        <div className="order-success__subtotal-row">
          <span>Items subtotal</span>
          <span>{formatPrice(itemsSubtotal)}</span>
        </div>
        {!isPickup && (
          <div className="order-success__delivery-row">
            <span>Delivery fee</span>
            <span>To be quoted</span>
          </div>
        )}
        <div className="order-success__total-row">
          <span>{isPickup ? 'Total' : 'Subtotal due now'}</span>
          <span className="order-success__total-amount">{formatPrice(itemsSubtotal)}</span>
        </div>
      </section>

      <div className="order-success__actions">
        <button
          className="order-success__btn-primary"
          onClick={() => navigate(`/orders/${order.orderId}`)}
        >
          <ShoppingBag size={16} /> Track My Order <ArrowRight size={16} />
        </button>
        <button
          className="order-success__btn-secondary"
          onClick={() => navigate(ROUTES.MENU)}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
