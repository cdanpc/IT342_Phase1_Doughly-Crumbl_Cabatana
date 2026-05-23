import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { getAdminOrders } from '../../shared/api/orderApi';
import { formatDate, formatOrderStatus, formatPrice } from '../../shared/utils/formatters';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import type { Order, OrderStatus } from '../../shared/types';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';
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
  const { lastNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [loadError, setLoadError] = useState('');

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) { setIsLoading(true); setLoadError(''); }
    try {
      const params = filterStatus !== 'ALL' ? { status: filterStatus } : undefined;
      const data = await getAdminOrders(params);
      setOrders(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = status
        ? `Failed to load orders (HTTP ${status})`
        : 'Failed to load orders - backend may be unreachable';
      if (!silent) {
        setLoadError(msg);
        toast.error(msg, { duration: 8000 });
        setOrders([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!lastNotification?.orderId) return;
    fetchOrders(true);
  }, [fetchOrders, lastNotification?.id, lastNotification?.orderId]);

  const filtered = filterStatus === 'ALL' ? orders : orders.filter((order) => order.status === filterStatus);

  if (isLoading) {
    return (
      <div className="admin-orders__loading">
        <div className="spinner" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-orders__page">
        <PageHeader title="Orders" />
        <ErrorState message={loadError} onRetry={() => fetchOrders()} className="admin-orders__error" />
      </div>
    );
  }

  return (
    <div className="admin-orders__page">
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />

      <div className="admin-orders__filter-row">
        <label className="admin-orders__filter-label">Filter by status</label>
        <div className="admin-orders__select-wrapper">
          <select
            className="admin-orders__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : formatOrderStatus(status)}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="admin-orders__select-icon" />
        </div>
      </div>

      <div className="admin-orders__table-container">
        <table className="admin-orders__table">
          <thead>
            <tr className="admin-orders__thead-row">
              <th className="admin-orders__th">Order ID</th>
              <th className="admin-orders__th">Date</th>
              <th className="admin-orders__th">Items</th>
              <th className="admin-orders__th">Total</th>
              <th className="admin-orders__th">Status</th>
              <th className="admin-orders__th admin-orders__th--right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.orderId} className="admin-orders__row">
                <td className="admin-orders__td admin-orders__td--bold">#{order.orderId}</td>
                <td className="admin-orders__td">{formatDate(order.orderDate)}</td>
                <td className="admin-orders__td">{order.itemCount ?? order.items?.length ?? '-'}</td>
                <td className="admin-orders__td admin-orders__td--semibold">{formatPrice(order.totalAmount)}</td>
                <td className="admin-orders__td">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="admin-orders__td admin-orders__td--right">
                  <button
                    className="admin-orders__view-btn"
                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="admin-orders__empty">No orders found.</div>
        )}
      </div>
    </div>
  );
}
