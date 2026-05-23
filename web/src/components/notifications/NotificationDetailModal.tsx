import { useNavigate } from 'react-router-dom';
import { Bell, ExternalLink, CheckCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import { useAuth } from '../../shared/hooks/AuthContext';
import type { Notification } from '../../shared/types';
import './NotificationDetailModal.css';

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-PH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTypeTone(type: string): 'info' | 'warning' | 'success' | 'danger' | 'default' {
  if (['NEW_ORDER', 'ORDER_PLACED'].includes(type)) return 'info';
  if (['PAYMENT_SUBMITTED', 'PAYMENT_REQUIRED'].includes(type)) return 'warning';
  if (['PAYMENT_CONFIRMED', 'ORDER_COMPLETED', 'READY'].includes(type)) return 'success';
  if (['ORDER_CANCELLED'].includes(type)) return 'danger';
  return 'default';
}

function typeLabel(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function NotificationDetailModal({ notification, onClose }: Props) {
  const navigate = useNavigate();
  const { markRead } = useNotifications();
  const { isAdmin } = useAuth();

  if (!notification) return null;

  async function handleMarkRead() {
    if (!notification || notification.read) return;
    try { await markRead(notification.id); } catch { /* badge self-corrects */ }
  }

  function handleViewOrder() {
    if (!notification?.orderId) return;
    const isAdminNotif = ['NEW_ORDER', 'PAYMENT_SUBMITTED'].includes(notification.type);
    const route = isAdminNotif || isAdmin
      ? `/admin/orders/${notification.orderId}`
      : `/orders/${notification.orderId}`;
    navigate(route);
    onClose();
  }

  return (
    <Modal
      isOpen={notification !== null}
      onClose={onClose}
      title={notification.title}
      maxWidth={480}
    >
      <div className="notif-detail">
        <div className="notif-detail__meta">
          <Badge tone={getTypeTone(notification.type)}>{typeLabel(notification.type)}</Badge>
          {!notification.read && (
            <span className="notif-detail__unread-dot" aria-label="Unread" />
          )}
        </div>

        <div className="notif-detail__icon-row">
          <div className="notif-detail__icon-wrap">
            <Bell size={20} />
          </div>
        </div>

        <p className="notif-detail__message">{notification.message}</p>

        <div className="notif-detail__timestamp">
          {formatFullDate(notification.createdAt)}
        </div>

        <div className="notif-detail__actions">
          {notification.orderId && (
            <button className="notif-detail__btn notif-detail__btn--primary" onClick={handleViewOrder}>
              <ExternalLink size={15} />
              View Order #{notification.orderId}
            </button>
          )}
          {!notification.read && (
            <button className="notif-detail__btn notif-detail__btn--ghost" onClick={handleMarkRead}>
              <CheckCheck size={15} />
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
