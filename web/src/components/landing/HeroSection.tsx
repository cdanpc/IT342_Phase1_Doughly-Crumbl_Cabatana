import { ArrowRight, Clock, ShoppingBag, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import PageContainer from '../layout/PageContainer';
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

        <div className="landing-hero__visual" aria-label="Featured Doughly Crumbl cookie box">
          <div className="cookie-showcase">
            <div className="cookie-showcase__card cookie-showcase__card--main">
              <span className="cookie-art cookie-art--choco" />
              <div>
                <p>Signature box</p>
                <strong>Assorted cookie cravings</strong>
              </div>
            </div>
            <div className="cookie-showcase__plate">
              <span className="cookie-art cookie-art--red" />
              <span className="cookie-art cookie-art--cream" />
              <span className="cookie-art cookie-art--dark" />
            </div>
            <div className="cookie-showcase__note cookie-showcase__note--top">
              <Clock size={17} />
              Baked fresh
            </div>
            <div className="cookie-showcase__note cookie-showcase__note--bottom">
              <ShoppingBag size={17} />
              Ready for pickup
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
