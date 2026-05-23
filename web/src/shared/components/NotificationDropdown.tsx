import { useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/NotificationContext';
import type { Notification } from '../types';
import './NotificationDropdown.css';

interface Props {
  onClose: () => void;
  onSelectNotification: (notification: Notification) => void;
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

export default function NotificationDropdown({ onClose, onSelectNotification }: Props) {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleClick(n: Notification) {
    onClose();
    onSelectNotification(n);
  }

  async function handleMarkAllRead() {
    try { await markAllRead(); } catch { /* badge self-corrects on next load */ }
  }

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title"><Bell size={16} /> Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-dropdown__mark-all" onClick={handleMarkAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="notif-dropdown__list">
        {notifications.length === 0 ? (
          <div className="notif-dropdown__empty">
            <Bell size={26} />
            <strong>No notifications yet</strong>
            <span>Order and payment updates will appear here.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              className={`notif-dropdown__item${n.read ? '' : ' notif-dropdown__item--unread'}`}
              onClick={() => handleClick(n)}
            >
              <div className="notif-dropdown__item-title">{n.title}</div>
              <div className="notif-dropdown__item-message">{n.message}</div>
              <div className="notif-dropdown__item-time">{timeAgo(n.createdAt)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
