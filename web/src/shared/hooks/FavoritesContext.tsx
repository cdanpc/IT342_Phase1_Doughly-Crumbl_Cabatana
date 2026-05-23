/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../api/profileApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || isAdmin) return;
    getFavorites()
      .then((products) => setFavoriteIds(new Set(products.map((p) => p.id))))
      .catch(() => {});
  }, [isAuthenticated, isAdmin]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: number) => {
      const wasFavorited = favoriteIds.has(productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (wasFavorited) {
          await removeFavorite(productId);
        } else {
          const updated = await addFavorite(productId);
          setFavoriteIds(new Set(updated.map((p) => p.id)));
        }
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error('Failed to update favorites. Please try again.');
      }
    },
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
