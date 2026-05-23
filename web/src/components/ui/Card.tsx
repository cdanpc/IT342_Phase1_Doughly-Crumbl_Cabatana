import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export default function Card({ children, className = '', interactive = false, ...props }: CardProps) {
  return (
    <div className={`ui-card ${interactive ? 'ui-card--interactive' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
