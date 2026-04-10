import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderPanel from './OrderPanel';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';
import { ROUTES } from '../../utils/routes';
import './AppLayout.css';

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();
  const { isOrderPanelOpen, closeOrderPanel } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith(ROUTES.ORDERS)) {
      closeOrderPanel();
    }
  }, [location.pathname, closeOrderPanel]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div
        className={`app-layout__main ${!isAdmin && isOrderPanelOpen ? 'app-layout__main--with-panel' : ''}`}
      >
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="app-layout__content">
          <Outlet context={{ searchQuery }} />
        </div>
      </div>
      {!isAdmin && isOrderPanelOpen && <OrderPanel />}
    </div>
  );
}
