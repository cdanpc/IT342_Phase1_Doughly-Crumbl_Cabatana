import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderPanel from './OrderPanel';
import { useAuth } from '../../store/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`app-layout__main ${!isAdmin ? 'app-layout__main--with-panel' : ''}`}>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="app-layout__content">
          <Outlet context={{ searchQuery }} />
        </div>
      </div>
      {!isAdmin && <OrderPanel />}
    </div>
  );
}
