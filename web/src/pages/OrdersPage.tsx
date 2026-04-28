import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { getMyOrders } from '../api/orderApi';
import {
  formatPrice,
  formatDate,
  getStatusColor,
  formatOrderStatus,
  getOrderStatusHelperText,
} from '../utils/formatters';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';

const ACTIVE_STATUSES = [
  'ORDER_PLACED', 'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PAYMENT_CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'READY',
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      if (!silent) {
        toast.error('Failed to load orders. Please try again.');
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30s if there are active orders
  useEffect(() => {
    const hasActive = orders.some((o) => ACTIVE_STATUSES.includes(o.status));
    if (!hasActive) return;
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [orders, fetchOrders]);

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, margin: 0 }}>
          My Orders
        </h2>
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', fontSize: 13, fontWeight: 600,
            border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            background: '#fff', cursor: isRefreshing ? 'not-allowed' : 'pointer',
            color: 'var(--color-text-secondary)',
          }}
        >
          <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Track your order history — auto-refreshes every 30s for active orders
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
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
              </div>

              {getOrderStatusHelperText(order.status) && (
                <p style={{ marginTop: 2, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {getOrderStatusHelperText(order.status)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
