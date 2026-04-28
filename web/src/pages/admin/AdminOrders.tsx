import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { getAdminOrders } from '../../api/orderApi';
import { formatPrice, formatDate, getStatusColor, formatOrderStatus } from '../../utils/formatters';
import type { Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';
import '../../components/common/LoadingSpinner.css';
import './AdminOrders.css';

const STATUSES: (OrderStatus | 'ALL')[] = [
  'ALL',
  'ORDER_PLACED',
  'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PAYMENT_CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const params = filterStatus !== 'ALL' ? { status: filterStatus } : undefined;
        const data = await getAdminOrders(params);
        setOrders(data);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const msg = status
          ? `Failed to load orders (HTTP ${status})`
          : 'Failed to load orders — backend may be unreachable';
        toast.error(msg, { duration: 8000 });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [filterStatus]);

  const filtered = filterStatus === 'ALL' ? orders : orders.filter((o) => o.status === filterStatus);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 4 }}>
        Orders
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
        {orders.length} total orders
      </p>

      {/* Status Filter */}
      <div className="admin-orders__filter-row">
        <label className="admin-orders__filter-label">Filter by status</label>
        <div className="admin-orders__select-wrapper">
          <select
            className="admin-orders__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : formatOrderStatus(s)}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="admin-orders__select-icon" />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Items</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.orderId} style={{ borderBottom: '1px solid #F0F0F0' }}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>#{order.orderId}</td>
                <td style={tdStyle}>{formatDate(order.orderDate)}</td>
                <td style={tdStyle}>{order.itemCount ?? order.items?.length ?? '—'}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{formatPrice(order.totalAmount)}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: getStatusColor(order.status) + '20',
                    color: getStatusColor(order.status),
                    fontSize: 12, fontWeight: 600, padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {formatOrderStatus(order.status)}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button
                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    style={{
                      padding: '6px 14px', background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)', fontWeight: 600, fontSize: 13,
                      border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600,
  color: 'var(--color-text-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 14, verticalAlign: 'middle',
};
