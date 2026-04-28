import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ClipboardList, TrendingUp, Clock } from 'lucide-react';
import { getAdminOrders } from '../../shared/api/orderApi';
import { getAdminProducts } from '../../shared/api/productApi';
import { ROUTES } from '../../shared/utils/routes';
import type { Order, Product } from '../../shared/types';
import '../../shared/components/LoadingSpinner.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersData, productsData] = await Promise.all([
          getAdminOrders(),
          getAdminProducts(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingCount = orders.filter(
    (o) => o.status === 'ORDER_PLACED' || o.status === 'AWAITING_DELIVERY_QUOTE'
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'COMPLETED').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: <Package size={24} />, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Total Orders', value: orders.length, icon: <ClipboardList size={24} />, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Pending Orders', value: pendingCount, icon: <Clock size={24} />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Delivered', value: deliveredCount, icon: <TrendingUp size={24} />, color: '#16A34A', bg: '#F0FFF4' },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
        Admin Dashboard
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Overview of your store
      </p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
            boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: stat.bg, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          style={{
            background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
            boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
        >
          <Package size={32} color="var(--color-primary)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
            Manage Products
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Add, edit, or remove products from your menu
          </p>
        </div>

        <div
          onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
          style={{
            background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
            boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
        >
          <ClipboardList size={32} color="var(--color-primary)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
            Manage Orders
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            View orders and update their status
          </p>
        </div>
      </div>
    </div>
  );
}
