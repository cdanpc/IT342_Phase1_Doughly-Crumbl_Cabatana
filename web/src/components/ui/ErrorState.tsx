import { AlertCircle } from 'lucide-react';
import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message, title = 'Something went wrong', onRetry, className }: ErrorStateProps) {
  return (
    <div className={`error-state${className ? ` ${className}` : ''}`} role="alert">
      <div className="error-state__icon">
        <AlertCircle size={22} />
      </div>
      <div className="error-state__body">
        <strong className="error-state__title">{title}</strong>
        <p className="error-state__message">{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="error-state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
