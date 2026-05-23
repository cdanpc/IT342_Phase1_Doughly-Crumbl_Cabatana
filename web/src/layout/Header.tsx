import { useState } from 'react';
import { Search, ShoppingCart, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../shared/hooks/CartContext';
import { useAuth } from '../shared/hooks/AuthContext';
import { useNotifications } from '../shared/hooks/NotificationContext';
import { ROUTES } from '../shared/utils/routes';
import NotificationDropdown from '../shared/components/NotificationDropdown';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import Logo from '../components/ui/Logo';
import type { Notification } from '../shared/types';
import './Header.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, toggleOrderPanel, openOrderPanel } = useCart();
  const { isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  function handleOrderBagClick() {
    if (location.pathname !== ROUTES.MENU) {
      navigate(ROUTES.MENU);
      openOrderPanel();
      return;
    }

    toggleOrderPanel();
  }

  function handleSelectNotification(notification: Notification) {
    setShowNotifications(false);
    setSelectedNotification(notification);
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__logo" onClick={() => navigate(isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.MENU)}>
          <Logo variant="red" />
        </div>

        {!isAdmin && (
          <div className="app-header__search">
            <Search size={16} className="app-header__search-icon" />
            <input
              className="app-header__search-input"
              type="text"
              placeholder="Search cookies, brownies, flavors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="app-header__actions">
          <div className="app-header__notif-wrapper">
            <button
              className="app-header__notif-btn"
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="app-header__notif-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown
                onClose={() => setShowNotifications(false)}
                onSelectNotification={handleSelectNotification}
              />
            )}
          </div>

          {!isAdmin && (
            <button
              className="app-header__cart"
              onClick={handleOrderBagClick}
              aria-label={`Order bag${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? '' : 's'}` : ', empty'}`}
              title="Order bag"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="app-header__cart-badge">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
}
