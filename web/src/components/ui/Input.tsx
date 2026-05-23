import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export default function Input({ id, label, error, className = '', ...props }: InputProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`ui-field__input ${error ? 'ui-field__input--error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <span className="ui-field__error" id={describedBy} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
