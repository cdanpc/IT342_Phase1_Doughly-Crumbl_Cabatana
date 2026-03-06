import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { ROUTES } from '../utils/routes';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');

    if (!email.trim() || !password.trim()) {
      setApiError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back!');
      // Auth context will update isAdmin — check from the stored data
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        navigate(parsed.role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.MENU);
      } else {
        navigate(ROUTES.MENU);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Invalid email or password.';
      setApiError(message);
      toast.error(message);
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
              className="auth-form__input"
              type="email"
              placeholder="johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Password</label>
            <div className="auth-form__input-wrapper">
              <input
                className="auth-form__input auth-form__input--with-toggle"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
