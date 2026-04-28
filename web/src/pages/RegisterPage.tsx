import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { ROUTES } from '../utils/routes';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';
import './AuthPages.css';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!address.trim() || address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!password || password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        confirmPassword,
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      toast.success('Account created successfully!');
      navigate(ROUTES.MENU);
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; fields?: Record<string, string> } };
        request?: unknown;
      };

      if (!error.response) {
        const msg = 'Cannot connect to server. Make sure the backend is running.';
        setApiError(msg);
        toast.error(msg);
        return;
      }

      const data = error.response.data;
      const message = data?.message || 'Registration failed. Please try again.';

      // If the backend returned per-field errors, map them to form state
      if (data?.fields && Object.keys(data.fields).length > 0) {
        const mapped: FormErrors = {};
        for (const [field, msg] of Object.entries(data.fields)) {
          // Backend field names: name, email, password, confirmPassword, address, phoneNumber
          if (field === 'name') mapped.firstName = msg;
          else if (field === 'email') mapped.email = msg;
          else if (field === 'password') mapped.password = msg;
          else if (field === 'confirmPassword') mapped.confirmPassword = msg;
          else if (field === 'address') mapped.address = msg;
          else if (field === 'phoneNumber') mapped.phoneNumber = msg;
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
        setApiError(message);
      } else {
        // Map known business-rule messages to specific fields
        if (message.toLowerCase().includes('email is already')) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else if (message.toLowerCase().includes('passwords do not match')) {
          setErrors((prev) => ({ ...prev, confirmPassword: message }));
        }
        setApiError(message);
      }

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
        <h1 className="auth-left__heading">Get started</h1>
        <p className="auth-left__subheading">Create new account</p>

        {apiError && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__row">
            <div className="auth-form__field">
              <label className="auth-form__label">First Name</label>
              <input
                className={`auth-form__input ${errors.firstName ? 'auth-form__input--error' : ''}`}
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && <span className="auth-form__field-error">{errors.firstName}</span>}
            </div>
            <div className="auth-form__field">
              <label className="auth-form__label">Last Name</label>
              <input
                className={`auth-form__input ${errors.lastName ? 'auth-form__input--error' : ''}`}
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && <span className="auth-form__field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Email</label>
            <input
              className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
              type="email"
              placeholder="johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="auth-form__field-error">{errors.email}</span>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Address</label>
            <input
              className={`auth-form__input ${errors.address ? 'auth-form__input--error' : ''}`}
              type="text"
              placeholder="Busogon st., San Remigio"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <span className="auth-form__field-error">{errors.address}</span>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Phone Number</label>
            <input
              className={`auth-form__input ${errors.phoneNumber ? 'auth-form__input--error' : ''}`}
              type="tel"
              placeholder="+63 ### ### ####"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phoneNumber && <span className="auth-form__field-error">{errors.phoneNumber}</span>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Password</label>
            <input
              className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="auth-form__field-error">{errors.password}</span>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">Confirm Password</label>
            <input
              className={`auth-form__input ${errors.confirmPassword ? 'auth-form__input--error' : ''}`}
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <span className="auth-form__field-error">{errors.confirmPassword}</span>}
          </div>

          <button className="auth-form__submit" type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner-small" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <button className="auth-footer__link" onClick={() => navigate(ROUTES.LOGIN)}>
            Sign In here
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
