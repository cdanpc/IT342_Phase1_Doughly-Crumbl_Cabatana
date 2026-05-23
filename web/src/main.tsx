import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './shared/hooks/AuthContext';
import { CartProvider } from './shared/hooks/CartContext';
import { NotificationProvider } from './shared/hooks/NotificationContext';
import { FavoritesProvider } from './shared/hooks/FavoritesContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <FavoritesProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'var(--font-body)',
                  borderRadius: 'var(--radius-md)',
                },
              }}
            />
          </FavoritesProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);
