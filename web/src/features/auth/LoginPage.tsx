import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import '../../shared/components/LoadingSpinner.css';
import './AuthPages.css';

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Fresh cookies are waiting"
      title="Welcome back to your bakery dashboard."
      subtitle="Sign in to continue ordering, track your latest box, and keep your Doughly Crumbl details ready for checkout."
    >
      <LoginForm />
    </AuthLayout>
  );
}
