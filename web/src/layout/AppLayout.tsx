import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderPanel from './OrderPanel';
import CheckoutModal from '../features/checkout/CheckoutModal';
import { useAuth } from '../shared/hooks/AuthContext';
import { useCart } from '../shared/hooks/CartContext';
import { ROUTES } from '../shared/utils/routes';
import './AppLayout.css';

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();
  const { isOrderPanelOpen, closeOrderPanel, isCheckoutOpen, closeCheckout } = useCart();
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
      {!isAdmin && isOrderPanelOpen && (
        <>
          <div className="app-layout__overlay" onClick={closeOrderPanel} />
          <OrderPanel />
        </>
      )}
      {!isAdmin && <CheckoutModal isOpen={isCheckoutOpen} onClose={closeCheckout} />}
    </div>
  );
}
