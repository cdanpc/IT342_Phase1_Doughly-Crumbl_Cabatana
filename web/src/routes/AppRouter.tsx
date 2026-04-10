import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { ProtectedRoute, GuestRoute } from '../components/common/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AppLayout from '../components/layout/AppLayout';
import MenuPage from '../pages/MenuPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import PaymentInstructionsPage from '../pages/PaymentInstructionsPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import CheckoutPage from '../pages/CheckoutPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminOrderDetail from '../pages/admin/AdminOrderDetail';
import CareGuidePage from '../pages/CareGuidePage';
import AboutPage from '../pages/AboutPage';

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
          <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
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
