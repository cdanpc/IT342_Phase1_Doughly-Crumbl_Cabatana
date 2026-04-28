import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { ROUTES } from '../utils/routes';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.MENU} replace />;
  }

  return <>{children}</>;
}

/**
 * Redirect authenticated users away from auth pages
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.MENU} replace />;
  }

  return <>{children}</>;
}
