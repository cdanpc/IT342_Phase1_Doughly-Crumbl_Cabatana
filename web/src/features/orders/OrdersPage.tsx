import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import SectionHeader from '../../components/layout/SectionHeader';
import OrderCard from '../../components/orders/OrderCard';
import { getMyOrders } from '../../shared/api/orderApi';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import { ACTIVE_ORDER_STATUSES } from '../../shared/utils/formatters';
import type { Order } from '../../shared/types';
import './OrdersPage.css';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { lastNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) { setIsLoading(true); setLoadError(''); }
    else setIsRefreshing(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      if (!silent) {
        const message = 'Failed to load orders. Please try again.';
        setLoadError(message);
        toast.error(message);
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

  useEffect(() => {
    const hasActive = orders.some((order) => ACTIVE_ORDER_STATUSES.includes(order.status as typeof ACTIVE_ORDER_STATUSES[number]));
    if (!hasActive) return;
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [orders, fetchOrders]);

  useEffect(() => {
    if (!lastNotification?.orderId) return;
    fetchOrders(true);
  }, [lastNotification?.id, lastNotification?.orderId, fetchOrders]);

  return (
    <div className="orders-page">
      <div className="orders-page__hero">
        <SectionHeader
          eyebrow="My orders"
          title="Track every Doughly Crumbl box."
          description="Active orders refresh every 30 seconds so payment, delivery, and completion updates stay easy to follow."
          action={
            <Button variant="secondary" onClick={() => fetchOrders(true)} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'orders-page__spin' : ''} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <LoadingState label="Loading your orders..." />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => fetchOrders()} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Your order history will appear here after checkout."
          actionLabel="Browse menu"
          onAction={() => navigate('/menu')}
          icon={<ShoppingBag size={30} />}
        />
      ) : (
        <div className="orders-page__list">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onClick={() => navigate(`/orders/${order.orderId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
