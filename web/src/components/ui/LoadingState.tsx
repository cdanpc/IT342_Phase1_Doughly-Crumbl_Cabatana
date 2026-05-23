import './LoadingState.css';

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
