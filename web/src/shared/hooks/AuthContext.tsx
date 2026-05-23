import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';
import * as authApi from '../api/authApi';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  updateCurrentUser: (data: Partial<Pick<AuthUser, 'name' | 'email'>>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read from localStorage synchronously so auth state is ready before first render
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed.token) return parsed;
      } catch {
        localStorage.removeItem('auth');
      }
    }
    return null;
  });
  // Synchronous init means no async loading phase is needed
  const isLoading = false;

  const login = useCallback(async (data: LoginRequest) => {
    const authUser = await authApi.login(data);
    setUser(authUser);
    localStorage.setItem('auth', JSON.stringify(authUser));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const authUser = await authApi.register(data);
    setUser(authUser);
    localStorage.setItem('auth', JSON.stringify(authUser));
  }, []);

  const updateCurrentUser = useCallback((data: Partial<Pick<AuthUser, 'name' | 'email'>>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      localStorage.setItem('auth', JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        updateCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
