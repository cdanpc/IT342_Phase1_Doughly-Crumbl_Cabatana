import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Cart } from '../types';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // Cart may not exist yet — that's okay
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    try {
      const updatedCart = await cartApi.addToCart({ productId, quantity });
      setCart(updatedCart);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add item to cart');
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateCartItem(cartItemId, { quantity });
      setCart(updatedCart);
    } catch {
      toast.error('Failed to update quantity');
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      const updatedCart = await cartApi.removeCartItem(cartItemId);
      setCart(updatedCart);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCartHandler = useCallback(async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
    } catch {
      toast.error('Failed to clear cart');
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount: cart?.itemCount ?? 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart: clearCartHandler,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
