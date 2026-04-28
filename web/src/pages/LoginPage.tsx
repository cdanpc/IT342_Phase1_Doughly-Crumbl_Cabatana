import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { ROUTES } from '../utils/routes';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';
import './AuthPages.css';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    // Client-side validation
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
        // Network error — backend not reachable
        const msg = 'Cannot connect to server. Make sure the backend is running.';
        setApiError(msg);
        toast.error(msg);
        return;
      }

      const message = error.response.data?.message || 'Login failed. Please try again.';
      setApiError(message);
      toast.error(message);

      // Highlight the relevant field based on the error message
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
    <div className="auth-page">
      <div className="auth-left">
        {/* Logo */}
        <div className="auth-left__logo" onClick={() => navigate(ROUTES.LANDING)} style={{ cursor: 'pointer' }}>
          <div className="auth-left__logo-icon">
            <Cookie size={28} />
          </div>
          <span className="auth-left__logo-text">Doughly Crumbl</span>
        </div>

        {/* Form */}
        <h1 className="auth-left__heading auth-left__heading--large">Sign In</h1>
        <p className="auth-left__subheading auth-left__subheading--wide">
          Access your Doughly Crumbl account
        </p>

        {apiError && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label">Email</label>
            <input
              className={`auth-form__input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
              type="email"
              placeholder="johndoe@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
            />
            {fieldErrors.email && <span className="auth-form__field-error">{fieldErrors.email}</span>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Password</label>
            <div className="auth-form__input-wrapper">
              <input
                className={`auth-form__input auth-form__input--with-toggle ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
              />
              <button
                type="button"
                className="auth-form__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className="auth-form__field-error">{fieldErrors.password}</span>}
          </div>

          <button className="auth-form__submit" type="submit" disabled={isLoading} style={{ marginTop: '28px' }}>
            {isLoading ? <span className="spinner-small" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '28px' }}>
          Don't have an account?{' '}
          <button className="auth-footer__link" onClick={() => navigate(ROUTES.REGISTER)}>
            Sign up here
          </button>
        </p>
      </div>

      {/* Right decorative panel */}
      <div className="auth-right">
        <div className="auth-right__circle auth-right__circle--1" />
        <div className="auth-right__circle auth-right__circle--2" />
        <div className="auth-right__circle auth-right__circle--3" />
      </div>
    </div>
  );
}
