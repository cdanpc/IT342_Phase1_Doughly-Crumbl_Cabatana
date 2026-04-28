import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from '../shared/utils/routes';
import { ProtectedRoute, GuestRoute } from '../shared/components/ProtectedRoute';
import LandingPage from '../features/landing/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import AppLayout from '../layout/AppLayout';
import MenuPage from '../features/menu/MenuPage';
import OrdersPage from '../features/orders/OrdersPage';
import OrderDetailPage from '../features/orders/OrderDetailPage';
import PaymentInstructionsPage from '../features/orders/PaymentInstructionsPage';
import OrderConfirmationPage from '../features/orders/OrderConfirmationPage';
import AdminDashboard from '../features/admin/AdminDashboard';
import AdminProducts from '../features/admin/AdminProducts';
import AdminOrders from '../features/admin/AdminOrders';
import AdminOrderDetail from '../features/admin/AdminOrderDetail';
import CareGuidePage from '../features/care-guide/CareGuidePage';
import AboutPage from '../features/about/AboutPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Guest routes */}
        <Route
          path={ROUTES.LANDING}
          element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Authenticated customer routes (with AppLayout shell) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.MENU} element={<MenuPage />} />
          <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
          <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetailPage />} />
          <Route path={ROUTES.PAYMENT_INSTRUCTIONS} element={<PaymentInstructionsPage />} />
          <Route path={ROUTES.ORDER_SUCCESS} element={<OrderConfirmationPage />} />
<Route path={ROUTES.CARE_GUIDE} element={<CareGuidePage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        </Route>

        {/* Admin routes (with AppLayout shell) */}
        <Route
          element={
            <ProtectedRoute requireAdmin>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProducts />} />
          <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrders />} />
          <Route path={ROUTES.ADMIN_ORDER_DETAIL} element={<AdminOrderDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
