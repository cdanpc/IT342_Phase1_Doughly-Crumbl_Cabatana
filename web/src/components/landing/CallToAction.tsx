import { ArrowRight, Flame, Snowflake, TimerReset } from 'lucide-react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import PageContainer from '../layout/PageContainer';
import './LandingSections.css';

interface CallToActionProps {
  onOrderNow: () => void;
  onRegister: () => void;
}

export default function CallToAction({ onOrderNow, onRegister }: CallToActionProps) {
  return (
    <>
      <section className="landing-section freshness-section" id="freshness">
        <PageContainer className="freshness-grid">
          <div>
            <p className="landing-kicker">Cookie care</p>
            <h2>Keep every cookie soft, warm, and ready for later.</h2>
            <p>
              Doughly Crumbl guides customers on storage, reheating, and freezing so the cookie experience stays consistent beyond checkout.
            </p>
          </div>
          <div className="care-steps">
            <span><TimerReset size={20} /> Room temperature for up to one week</span>
            <span><Flame size={20} /> Warm for 8-10 seconds before serving</span>
            <span><Snowflake size={20} /> Freeze sealed cookies for longer storage</span>
          </div>
        </PageContainer>
      </section>

      <section className="landing-cta">
        <PageContainer className="landing-cta__inner">
          <div>
            <Logo variant="white" />
            <h2>Ready for your next Doughly Crumbl box?</h2>
            <p>Sign in to order faster, or create an account and keep your cookie history in one place.</p>
          </div>
          <div className="landing-cta__actions">
            <Button variant="secondary" onClick={onOrderNow}>
              Sign in <ArrowRight size={18} />
            </Button>
            <Button className="landing-cta__register" onClick={onRegister}>
              Create account
            </Button>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
