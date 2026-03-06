import { Cookie, Search, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { itemCount } = useCart();
  const { isAdmin } = useAuth();

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
        <button className="app-header__cart" onClick={() => navigate(ROUTES.MENU)}>
          <ShoppingCart size={28} />
          {itemCount > 0 && <span className="app-header__cart-badge">{itemCount}</span>}
        </button>
      )}
    </header>
  );
}
