import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ClipboardList, Clock, Package, ReceiptText, Truck } from 'lucide-react';
import { getAdminOrders } from '../../shared/api/orderApi';
import { getAdminProducts } from '../../shared/api/productApi';
import { formatPrice, formatDate } from '../../shared/utils/formatters';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { ROUTES } from '../../shared/utils/routes';
import type { Order, Product } from '../../shared/types';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';
import './AdminDashboard.css';

const RECENT_COUNT = 8;

interface StatCard {
  label: string;
  hint: string;
  value: number | string;
  icon: React.ReactNode;
  variant: 'blue' | 'purple' | 'amber' | 'orange' | 'teal' | 'green';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { lastNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        getAdminOrders(),
        getAdminProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch {
      if (!silent) toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!lastNotification?.orderId) return;
    fetchData(true);
  }, [fetchData, lastNotification?.id, lastNotification?.orderId]);

  const awaitingQuoteCount = orders.filter((o) => o.status === 'AWAITING_DELIVERY_QUOTE').length;

  const paymentDueCount = orders.filter(
    (o) =>
      o.status === 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED' ||
      o.status === 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION'
  ).length;

  const inProgressCount = orders.filter(
    (o) => o.status === 'PREPARING' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'READY'
  ).length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  const revenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const stats: StatCard[] = [
    { label: 'Total Orders', hint: 'All orders in the system', value: orders.length, icon: <ClipboardList size={24} />, variant: 'purple' },
    { label: 'Awaiting Quote', hint: 'Delivery fee needed', value: awaitingQuoteCount, icon: <Clock size={24} />, variant: 'amber' },
    { label: 'Payment Queue', hint: 'Due or awaiting confirmation', value: paymentDueCount, icon: <AlertCircle size={24} />, variant: 'orange' },
    { label: 'In Progress', hint: 'Preparing, ready, or out', value: inProgressCount, icon: <Truck size={24} />, variant: 'teal' },
    { label: 'Completed', hint: 'Finished orders', value: completedCount, icon: <CheckCircle size={24} />, variant: 'green' },
    { label: 'Products', hint: 'Menu items available to manage', value: products.length, icon: <Package size={24} />, variant: 'blue' },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, RECENT_COUNT);

  if (isLoading) {
    return (
      <div className="admin-dashboard__loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__hero">
        <div>
          <span className="admin-dashboard__eyebrow">Store operations</span>
          <h2 className="admin-dashboard__title">Admin Dashboard</h2>
          <p className="admin-dashboard__subtitle">
            Track live order pressure, payment work, and completed revenue from real order data.
          </p>
        </div>
        <div className="admin-dashboard__revenue-card">
          <ReceiptText size={22} />
          <span>Completed Revenue</span>
          <strong>{formatPrice(revenue)}</strong>
        </div>
      </div>

      <div className="admin-dashboard__stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-dashboard__stat-card">
            <div className={`admin-dashboard__stat-icon admin-dashboard__stat-icon--${stat.variant}`}>
              {stat.icon}
            </div>
            <div>
              <div className="admin-dashboard__stat-label">{stat.label}</div>
              <div className="admin-dashboard__stat-value">{stat.value}</div>
              <div className="admin-dashboard__stat-hint">{stat.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-dashboard__recent">
        <div className="admin-dashboard__recent-header">
          <h3 className="admin-dashboard__recent-title">Recent Orders</h3>
          <button
            className="admin-dashboard__recent-link"
            onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
          >
            View all →
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="admin-dashboard__recent-empty">No orders yet.</div>
        ) : (
          <table className="admin-dashboard__recent-table">
            <thead>
              <tr>
                <th className="admin-dashboard__recent-th">Order</th>
                <th className="admin-dashboard__recent-th">Date</th>
                <th className="admin-dashboard__recent-th">Status</th>
                <th className="admin-dashboard__recent-th admin-dashboard__recent-th--right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.orderId}
                  className="admin-dashboard__recent-row"
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                >
                  <td className="admin-dashboard__recent-td admin-dashboard__recent-td--bold">
                    #{order.orderId}
                  </td>
                  <td className="admin-dashboard__recent-td">{formatDate(order.orderDate)}</td>
                  <td className="admin-dashboard__recent-td">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="admin-dashboard__recent-td admin-dashboard__recent-td--semibold admin-dashboard__recent-td--right">
                    {formatPrice(order.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-dashboard__links-grid">
        <div
          className="admin-dashboard__link-card"
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.ADMIN_PRODUCTS)}
        >
          <Package size={32} className="admin-dashboard__link-icon" />
          <h3 className="admin-dashboard__link-title">Manage Products</h3>
          <p className="admin-dashboard__link-desc">Add, edit, or remove products from your menu</p>
        </div>

        <div
          className="admin-dashboard__link-card"
          onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.ADMIN_ORDERS)}
        >
          <ClipboardList size={32} className="admin-dashboard__link-icon" />
          <h3 className="admin-dashboard__link-title">Manage Orders</h3>
          <p className="admin-dashboard__link-desc">View orders and update their status</p>
        </div>
      </div>
    </div>
  );
}
