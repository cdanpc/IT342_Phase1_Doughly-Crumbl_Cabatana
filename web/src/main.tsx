import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './shared/hooks/AuthContext';
import { CartProvider } from './shared/hooks/CartContext';
import { NotificationProvider } from './shared/hooks/NotificationContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
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
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);
