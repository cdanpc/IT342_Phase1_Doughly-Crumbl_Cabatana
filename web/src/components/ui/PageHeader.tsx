import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Button or other control placed flush-right */
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`page-header${className ? ` ${className}` : ''}`}>
      <div className="page-header__text">
        <h2 className="page-header__title">{title}</h2>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
