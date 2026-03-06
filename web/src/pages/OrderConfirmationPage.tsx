import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import type { Order } from '../types';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;

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

  return (
    <div style={{ padding: '48px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
      <CheckCircle size={64} color="var(--color-success)" style={{ marginBottom: 20 }} />

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
        Order Placed Successfully!
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 32 }}>
        Your order has been received and is being processed.
      </p>

      {/* Order summary card */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
        boxShadow: 'var(--shadow-card)', textAlign: 'left', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Order ID</span>
            <p style={{ fontWeight: 700, fontSize: 18 }}>#{order.orderId}</p>
          </div>
          <div style={{
            background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600,
            padding: '4px 12px', borderRadius: 'var(--radius-full)', height: 'fit-content',
            alignSelf: 'center',
          }}>
            {order.status}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          {formatDate(order.orderDate)}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0' }}>
            <span>{item.productName} × {item.quantity}</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(item.subtotal)}</span>
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button
          onClick={() => navigate(ROUTES.ORDERS)}
          style={{
            padding: '12px 28px', background: '#fff', color: 'var(--color-primary)',
            fontWeight: 600, fontSize: 15, border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}
        >
          View My Orders
        </button>
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
    </div>
  );
}
