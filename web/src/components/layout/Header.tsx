import { Cookie, Search, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../utils/routes';
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

  function handleOrderClick() {
    navigate(ROUTES.CHECKOUT);
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

      {!isAdmin && (
        <div className="app-header__actions">
          <button className="app-header__cart" onClick={handleOrderBagClick}>
            <ShoppingCart size={18} />
            <span className="app-header__cart-label">Add to Cart</span>
            <span className="app-header__cart-badge">{itemCount}</span>
          </button>

          <button
            className={`app-header__order-btn ${location.pathname.startsWith(ROUTES.ORDERS) ? 'app-header__order-btn--outline' : ''}`}
            onClick={handleOrderClick}
            disabled={itemCount === 0}
          >
            Order
          </button>
        </div>
      )}
    </header>
  );
}
