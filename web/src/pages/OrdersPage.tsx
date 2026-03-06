import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';
import type { Order } from '../types';
import '../components/common/LoadingSpinner.css';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
        My Orders
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Track your order history
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ fontSize: 16 }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div
              key={order.orderId}
              onClick={() => navigate(`/orders/${order.orderId}`)}
              style={{
                background: '#fff', borderRadius: 'var(--radius-md)', padding: 20,
                boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  Order #{order.orderId}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {formatDate(order.orderDate)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{formatPrice(order.totalAmount)}</span>
                <span style={{
                  background: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                  fontSize: 12, fontWeight: 600, padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
