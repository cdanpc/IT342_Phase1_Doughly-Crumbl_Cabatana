import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, FileText } from 'lucide-react';
import { getAdminOrderById, updateOrderStatus } from '../../api/orderApi';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import { ROUTES } from '../../utils/routes';
import type { Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';
import '../../components/common/LoadingSpinner.css';

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const data = await getAdminOrderById(Number(id));
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (!order || !id) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(Number(id), { status: newStatus });
      setOrder(updated);
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  }

  function getNextStatus(current: OrderStatus): OrderStatus | null {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 16, marginBottom: 24 }}>Order not found.</p>
        <button onClick={() => navigate(ROUTES.ADMIN_ORDERS)} style={backBtnStyle}>
          Back to Orders
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 800, animation: 'fadeIn 0.3s ease-out' }}>
      <button
        onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
          color: 'var(--color-text-secondary)', marginBottom: 24,
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28 }}>
            Order #{order.orderId}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {formatDate(order.orderDate)}
          </p>
        </div>
        <span style={{
          background: getStatusColor(order.status) + '20',
          color: getStatusColor(order.status),
          fontSize: 13, fontWeight: 600, padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
        }}>
          {order.status}
        </span>
      </div>

      {/* Status Progress */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
        boxShadow: 'var(--shadow-card)', marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Order Status
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {STATUS_FLOW.map((status, idx) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const isPast = idx <= currentIdx;
            const isCurrent = status === order.status;
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                  background: isCurrent ? getStatusColor(status) : isPast ? getStatusColor(status) + '30' : '#f0f0f0',
                  color: isCurrent ? '#fff' : isPast ? getStatusColor(status) : 'var(--color-text-muted)',
                }}>
                  {status}
                </div>
                {idx < STATUS_FLOW.length - 1 && (
                  <span style={{ color: isPast ? 'var(--color-primary)' : '#ddd' }}>→</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {nextStatus && order.status !== 'CANCELLED' && (
            <button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={isUpdating}
              style={{
                padding: '10px 24px', background: 'var(--color-primary)', color: '#fff',
                fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.6 : 1,
              }}
            >
              {isUpdating ? 'Updating...' : `Move to ${nextStatus}`}
            </button>
          )}
          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={isUpdating}
              style={{
                padding: '10px 24px', background: '#fff', color: 'var(--color-error)',
                fontWeight: 600, border: '1.5px solid var(--color-error)', borderRadius: 'var(--radius-sm)',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Delivery Info */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
        boxShadow: 'var(--shadow-card)', marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Delivery Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <MapPin size={16} color="var(--color-text-muted)" />
            <span>{order.deliveryAddress}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Phone size={16} color="var(--color-text-muted)" />
            <span>{order.contactNumber}</span>
          </div>
          {order.deliveryNotes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
              <FileText size={16} color="var(--color-text-muted)" style={{ marginTop: 2 }} />
              <span>{order.deliveryNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)', padding: 24,
        boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Order Items
        </h3>
        {order.items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 0',
            borderBottom: idx < order.items.length - 1 ? '1px solid #F0F0F0' : 'none',
          }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{item.productName}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13, marginLeft: 8 }}>
                × {item.quantity} @ {formatPrice(item.unitPrice)}
              </span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  padding: '10px 24px', background: 'var(--color-primary)', color: '#fff',
  fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
};
