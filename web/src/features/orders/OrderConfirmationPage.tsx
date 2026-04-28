import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import type { Order } from '../../shared/types';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  const fulfillmentMethod = (location.state?.fulfillmentMethod as string) ?? 'DELIVERY';
  const isPickup = fulfillmentMethod === 'PICKUP';

  if (!order) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          No order information found.
        </p>
        <button
          onClick={() => navigate(ROUTES.MENU)}
          style={{
            padding: '12px 28px', background: 'var(--color-primary)', color: '#fff',
            fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);

  return (
    <div style={{ padding: '48px 24px', maxWidth: 540, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Success icon */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <CheckCircle size={56} color="#16a34a" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, marginBottom: 8 }}>
          Order Placed!
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          {isPickup
            ? 'Your order is confirmed for pickup. We\'ll let you know when it\'s ready.'
            : 'Your order is received. The seller will quote your delivery fee shortly — check My Orders for updates.'}
        </p>
      </div>

      {/* Status notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: isPickup ? '#F0FDF4' : '#FFF8E7',
          border: `1px solid ${isPickup ? '#86EFAC' : '#F5C842'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          marginBottom: 20,
          fontSize: 13,
          color: isPickup ? '#15803D' : '#7a5c00',
          lineHeight: 1.5,
        }}
      >
        <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          {isPickup
            ? 'Status: Order Placed — We\'ll prepare your order and notify you when it\'s ready for pickup.'
            : 'Status: Awaiting Delivery Quote — The seller will add the delivery fee based on your location.'}
        </span>
      </div>

      {/* Order summary card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: 20,
          boxShadow: 'var(--shadow-card)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Order ID</div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>#{order.orderId}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>
            {formatDate(order.orderDate)}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

        {order.items.map((item, idx) => (
          <div
            key={idx}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0' }}
          >
            <span>
              {item.productName}{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>× {item.quantity}</span>
            </span>
            <span style={{ fontWeight: 600 }}>{formatPrice(item.subtotal)}</span>
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
          <span>Subtotal</span>
          <span>{formatPrice(itemsSubtotal)}</span>
        </div>
        {!isPickup && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
            <span>Delivery fee</span>
            <span style={{ fontStyle: 'italic' }}>To be quoted</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
          <span>{isPickup ? 'Total' : 'Subtotal Due'}</span>
          <span style={{ color: 'var(--color-primary)' }}>{formatPrice(itemsSubtotal)}</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate(`/orders/${order.orderId}`)}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <ShoppingBag size={16} /> Track My Order
        </button>
        <button
          onClick={() => navigate(ROUTES.MENU)}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: '#fff',
            color: 'var(--color-primary)',
            fontWeight: 600,
            fontSize: 15,
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
