import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, Info, BookMarked, LogOut, LayoutDashboard, Package, ClipboardList } from 'lucide-react';
import { useAuth } from '../shared/hooks/AuthContext';
import { ROUTES } from '../shared/utils/routes';
import './Sidebar.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  route: string;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    }
    if (showAvatarMenu) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAvatarMenu]);

  const customerNav: NavItem[] = [
    { icon: <UtensilsCrossed size={24} />, label: 'Menu', route: ROUTES.MENU },
    { icon: <ShoppingBag size={24} />, label: 'My Orders', route: ROUTES.ORDERS },
    { icon: <Info size={24} />, label: 'About', route: ROUTES.ABOUT },
    { icon: <BookMarked size={24} />, label: 'Care Guide', route: ROUTES.CARE_GUIDE },
  ];

  const adminNav: NavItem[] = [
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard', route: ROUTES.ADMIN_DASHBOARD },
    { icon: <Package size={24} />, label: 'Products', route: ROUTES.ADMIN_PRODUCTS },
    { icon: <ClipboardList size={24} />, label: 'Orders', route: ROUTES.ADMIN_ORDERS },
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  function handleLogout() {
    logout();
    navigate(ROUTES.LANDING);
  }

  function getInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__profile" ref={avatarRef}>
        <div
          className="sidebar__avatar sidebar__avatar--clickable"
          onClick={() => setShowAvatarMenu((v) => !v)}
          title="Account"
        >
          {user ? getInitials(user.name) : '??'}
        </div>
        <span className="sidebar__username">{user?.name?.split(' ')[0] || 'User'}</span>

        {showAvatarMenu && (
          <div className="sidebar__avatar-menu">
            <div className="sidebar__avatar-menu-header">
              <span className="sidebar__avatar-menu-name">{user?.name}</span>
              <span className="sidebar__avatar-menu-email">{user?.email}</span>
            </div>
            <hr className="sidebar__avatar-menu-divider" />
            <button
              className="sidebar__avatar-menu-signout"
              onClick={() => { setShowAvatarMenu(false); handleLogout(); }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.route}
            className={`sidebar__nav-item ${location.pathname === item.route ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => navigate(item.route)}
          >
            {item.icon}
            <span className="sidebar__nav-label">{item.label}</span>
          </button>
        ))}

        <button className="sidebar__nav-item sidebar__logout" onClick={handleLogout}>
          <LogOut size={24} />
          <span className="sidebar__nav-label">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
