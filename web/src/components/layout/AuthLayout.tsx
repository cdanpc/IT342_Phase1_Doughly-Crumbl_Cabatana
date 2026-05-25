import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { ROUTES } from '../../shared/utils/routes';
import Logo from '../ui/Logo';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, eyebrow, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <main className="auth-shell">
      <section className="auth-shell__form-panel">
        <button className="auth-shell__logo-button" onClick={() => navigate(ROUTES.LANDING)} aria-label="Go to Doughly Crumbl home">
          <Logo variant="red" />
        </button>
        <div className="auth-shell__form-card">
          {children}
        </div>
      </section>

      <aside className="auth-shell__brand-panel" aria-label="Doughly Crumbl brand story">
        <div className="auth-shell__brand-content">
          <p className="auth-shell__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <div className="auth-shell__proof-card">
            <Sparkles size={20} />
            <span>Small-batch cookies, baked fresh for every order.</span>
          </div>
          <ul className="auth-shell__benefits">
            <li><CheckCircle2 size={18} /> Freshly prepared pickup and delivery</li>
            <li><CheckCircle2 size={18} /> Secure checkout with order tracking</li>
            <li><CheckCircle2 size={18} /> Care tips for warm, soft cookies</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
