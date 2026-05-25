import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import PageContainer from '../layout/PageContainer';
import landingHero from '../../assets/products/landing-cookie-hero.png';
import './LandingSections.css';

interface HeroSectionProps {
  onOrderNow: () => void;
  onCreateAccount: () => void;
}

export default function HeroSection({ onOrderNow, onCreateAccount }: HeroSectionProps) {
  return (
    <section className="landing-hero">
      <PageContainer className="landing-hero__grid">
        <div className="landing-hero__copy">
          <p className="landing-kicker">
            <Sparkles size={16} />
            Cebu-made small-batch cookie orders
          </p>
          <h1>Doughly Tempted? Get it Crumbl.</h1>
          <p className="landing-hero__lead">
            Freshly baked cookies, brownies, and craveable boxes made to order with a smoother way to browse, checkout, and track every treat.
          </p>
          <div className="landing-hero__actions">
            <Button onClick={onOrderNow}>
              Order now <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={onCreateAccount}>
              Create account
            </Button>
          </div>
          <div className="landing-hero__stats" aria-label="Doughly Crumbl highlights">
            <span><strong>4+</strong> minimum cookies</span>
            <span><strong>Fresh</strong> baked to order</span>
            <span><strong>Track</strong> every order</span>
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-hero__visual-card">
            <img
              className="landing-hero__image"
              src={landingHero}
              alt="Assorted freshly baked Doughly Crumbl cookies"
            />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
