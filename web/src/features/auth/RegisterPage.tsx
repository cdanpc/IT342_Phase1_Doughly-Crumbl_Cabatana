import AuthLayout from '../../components/layout/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import '../../shared/components/LoadingSpinner.css';
import './AuthPages.css';

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Join the cookie list"
      title="Create an account built for faster cravings."
      subtitle="Save your contact details once, then browse, checkout, and follow every Doughly Crumbl order with less friction."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
