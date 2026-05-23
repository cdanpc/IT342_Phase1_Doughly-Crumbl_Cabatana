import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../shared/hooks/AuthContext';
import { ROUTES } from '../../shared/utils/routes';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import './AuthForms.css';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function clearErrors() {
    setApiError('');
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    const newFieldErrors: FieldErrors = {};
    if (!email.trim()) newFieldErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newFieldErrors.email = 'Enter a valid email address.';
    if (!password) newFieldErrors.password = 'Password is required.';
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back!');
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        navigate(parsed.role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.MENU);
      } else {
        navigate(ROUTES.MENU);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; request?: unknown; message?: string };

      if (!error.response) {
        const msg = 'Cannot connect to server. Make sure the backend is running.';
        setApiError(msg);
        toast.error(msg);
        return;
      }

      const message = error.response.data?.message || 'Login failed. Please try again.';
      setApiError(message);
      toast.error(message);

      if (message.toLowerCase().includes('email') || message.toLowerCase().includes('account')) {
        setFieldErrors({ email: message });
      } else if (message.toLowerCase().includes('password') || message.toLowerCase().includes('incorrect')) {
        setFieldErrors({ password: message });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-form-card">
      <p className="auth-form-card__eyebrow">Welcome back</p>
      <h1>Sign in to continue ordering.</h1>
      <p className="auth-form-card__support">
        Track orders, manage your cart, and get your fresh cookie fix without starting over.
      </p>

      {apiError && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}

      <form className="auth-form-stack" onSubmit={handleSubmit} noValidate>
        <Input
          id="login-email"
          label="Email"
          type="email"
          placeholder="johndoe@gmail.com"
          value={email}
          onChange={(event) => { setEmail(event.target.value); clearErrors(); }}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <PasswordInput
          id="login-password"
          label="Password"
          value={password}
          onChange={(value) => { setPassword(value); clearErrors(); }}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <Button type="submit" fullWidth isLoading={isLoading} className="auth-form-card__submit">
          Sign in
        </Button>
      </form>

      <p className="auth-switch">
        New to Doughly Crumbl?{' '}
        <button type="button" onClick={() => navigate(ROUTES.REGISTER)}>
          Create an account
        </button>
      </p>
    </div>
  );
}
