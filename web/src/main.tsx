import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
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
    </AuthProvider>
  </StrictMode>,
);
