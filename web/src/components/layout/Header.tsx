import { useState } from 'react';
import { Cookie, Search, ShoppingCart, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { ROUTES } from '../../utils/routes';
import NotificationDropdown from '../common/NotificationDropdown';
import './Header.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, toggleOrderPanel, openOrderPanel, closeOrderPanel } = useCart();
  const { isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  function handleOrderBagClick() {
    if (location.pathname !== ROUTES.MENU) {
      navigate(ROUTES.MENU);
      if (itemCount > 0) {
        openOrderPanel();
      } else {
        closeOrderPanel();
      }
      return;
    }

    if (itemCount > 0) {
      toggleOrderPanel();
      return;
    }

    closeOrderPanel();
  }

  return (
    <header className="app-header">
      <div className="app-header__logo" onClick={() => navigate(isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.MENU)}>
        <div className="app-header__logo-icon">
          <Cookie size={20} />
        </div>
        <span className="app-header__logo-text">Doughly Crumbl</span>
      </div>

      {!isAdmin && (
        <div className="app-header__search">
          <Search size={16} className="app-header__search-icon" />
          <input
            className="app-header__search-input"
            type="text"
            placeholder="Search menu here..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="app-header__actions">
        {/* Bell icon — visible for both customers and admins */}
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
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {!isAdmin && (
          <button className="app-header__cart" onClick={handleOrderBagClick}>
            <ShoppingCart size={18} />
            <span className="app-header__cart-label">Add to Cart</span>
            <span className="app-header__cart-badge">{itemCount}</span>
          </button>
        )}
      </div>
    </header>
  );
}
