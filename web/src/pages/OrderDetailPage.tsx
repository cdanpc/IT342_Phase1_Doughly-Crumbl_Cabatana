import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, FileText } from 'lucide-react';
import { getOrderById } from '../api/orderApi';
import {
  formatPrice,
  formatDate,
  getStatusColor,
  formatOrderStatus,
  getOrderStatusHelperText,
} from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import type { Order } from '../types';
import '../components/common/LoadingSpinner.css';

const STATUS_TIMELINE = [
  'ORDER_PLACED',
  'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PAYMENT_CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
];

function getStatusIndex(status: string): number {
  const timelineIndex = STATUS_TIMELINE.indexOf(status);
  if (timelineIndex >= 0) return timelineIndex;

  if (status === 'PENDING') return 0;
  if (status === 'CONFIRMED') return 4;
  if (status === 'READY') return 5;
  if (status === 'DELIVERED') return 7;

  return 0;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const data = await getOrderById(Number(id));
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

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
        <button
          onClick={() => navigate(ROUTES.ORDERS)}
          style={{
            padding: '10px 24px', background: 'var(--color-primary)', color: '#fff',
            fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 720, animation: 'fadeIn 0.3s ease-out' }}>
      <button
        onClick={() => navigate(ROUTES.ORDERS)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-secondary)',
          marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer',
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
          {formatOrderStatus(order.status)}
        </span>
      </div>

      {getOrderStatusHelperText(order.status) && (
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
          }}
        >
          {getOrderStatusHelperText(order.status)}
        </div>
      )}

      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: 20,
          boxShadow: 'var(--shadow-card)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 14 }}>
          Order Status Timeline
        </h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {STATUS_TIMELINE.map((status, idx) => {
            const active = idx <= getStatusIndex(order.status) && order.status !== 'CANCELLED';
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: active ? 'var(--color-primary)' : 'var(--color-border)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {formatOrderStatus(status)}
                </span>
              </div>
            );
          })}
          {order.status === 'CANCELLED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#DC2626',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: '#DC2626' }}>Cancelled</span>
            </div>
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

      <button
        onClick={() => navigate(`/orders/${order.orderId}/payment`)}
        style={{
          marginTop: 20,
          width: '100%',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--color-primary)',
          color: 'var(--color-primary)',
          background: '#fff',
          padding: '12px 16px',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Payment Instructions
      </button>
    </div>
  );
}
