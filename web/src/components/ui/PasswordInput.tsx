import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';
import './PasswordInput.css';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Enter your password',
  autoComplete,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-field">
      <Input
        id={id}
        label={label}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="password-field__input"
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
