import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/NotificationContext';
import type { Notification } from '../types';
import './NotificationDropdown.css';

interface Props {
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown({ onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function handleClick(n: Notification) {
    if (!n.read) await markRead(n.id);
    if (n.orderId) {
      const isAdminNotif = ['NEW_ORDER', 'PAYMENT_SUBMITTED'].includes(n.type);
      navigate(isAdminNotif ? `/admin/orders/${n.orderId}` : `/orders/${n.orderId}`);
    }
    onClose();
  }

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-dropdown__mark-all" onClick={() => markAllRead()}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-dropdown__list">
        {notifications.length === 0 ? (
          <div className="notif-dropdown__empty">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-dropdown__item${n.read ? '' : ' notif-dropdown__item--unread'}`}
              onClick={() => handleClick(n)}
            >
              <div className="notif-dropdown__item-title">{n.title}</div>
              <div className="notif-dropdown__item-message">{n.message}</div>
              <div className="notif-dropdown__item-time">{timeAgo(n.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
