import type { ReactNode } from 'react';
import './CareComponents.css';

interface CareTipCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export default function CareTipCard({ icon, title, children }: CareTipCardProps) {
  return (
    <article className="care-tip-card">
      <span className="care-tip-card__icon">{icon}</span>
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}
