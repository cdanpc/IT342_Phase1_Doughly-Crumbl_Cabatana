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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
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

  function clearField(field: keyof FormErrors) {
    setApiError('');
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

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
    } else if (!/^(09\d{9}|\+639\d{9})$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Enter a valid PH number (e.g. 09171234567)';
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

      if (data?.fields && Object.keys(data.fields).length > 0) {
        const mapped: FormErrors = {};
        for (const [field, msg] of Object.entries(data.fields)) {
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
    <div className="auth-form-card auth-form-card--register">
      <p className="auth-form-card__eyebrow">Create account</p>
      <h1>Start your next cookie order.</h1>
      <p className="auth-form-card__support">
        Save your details once and move faster from craving to checkout.
      </p>

      {apiError && (
        <div className="auth-error-banner">
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}

      <form className="auth-form-stack" onSubmit={handleSubmit} noValidate>
        <div className="auth-form-grid">
          <Input
            id="register-first-name"
            label="First name"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(event) => { setFirstName(event.target.value); clearField('firstName'); }}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            id="register-last-name"
            label="Last name"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(event) => { setLastName(event.target.value); clearField('lastName'); }}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="johndoe@gmail.com"
          value={email}
          onChange={(event) => { setEmail(event.target.value); clearField('email'); }}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          id="register-address"
          label="Address"
          type="text"
          placeholder="Busogon st., San Remigio"
          value={address}
          onChange={(event) => { setAddress(event.target.value); clearField('address'); }}
          error={errors.address}
          autoComplete="street-address"
        />

        <Input
          id="register-phone"
          label="Phone number"
          type="tel"
          placeholder="09171234567"
          value={phoneNumber}
          onChange={(event) => { setPhoneNumber(event.target.value); clearField('phoneNumber'); }}
          error={errors.phoneNumber}
          autoComplete="tel"
        />

        <div className="auth-form-grid">
          <PasswordInput
            id="register-password"
            label="Password"
            value={password}
            onChange={(value) => { setPassword(value); clearField('password'); }}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordInput
            id="register-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={(value) => { setConfirmPassword(value); clearField('confirmPassword'); }}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} className="auth-form-card__submit">
          Create account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>
          Sign in
        </button>
      </p>
    </div>
  );
}
