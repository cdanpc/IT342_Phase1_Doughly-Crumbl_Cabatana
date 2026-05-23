import type { ReactNode } from 'react';
import './Badge.css';

type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function Badge({ children, tone = 'default', className = '' }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${tone} ${className}`}>{children}</span>;
}
