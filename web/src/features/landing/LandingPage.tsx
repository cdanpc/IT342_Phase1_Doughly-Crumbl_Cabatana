import { useNavigate } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { ROUTES } from '../../shared/utils/routes';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-navbar__logo">
          <div className="landing-navbar__logo-icon">
            <Cookie size={22} />
          </div>
          <span className="landing-navbar__logo-text">Doughly Crumbl</span>
        </div>

        <div className="landing-navbar__links">
          <span className="landing-navbar__link">Home</span>
          <span className="landing-navbar__link" onClick={() => navigate(ROUTES.LOGIN)}>Menu</span>
          <span className="landing-navbar__link">Cookie Care</span>
          <span className="landing-navbar__link" onClick={() => navigate(ROUTES.LOGIN)}>Cookies</span>
        </div>

        <div className="landing-navbar__actions">
          <button className="landing-navbar__signin" onClick={() => navigate(ROUTES.LOGIN)}>
            Sign In
          </button>
          <button className="landing-navbar__signup" onClick={() => navigate(ROUTES.REGISTER)}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <p className="landing-hero__subtitle">
          Indulge in warm, chewy, flavor-packed cookies crafted to turn cravings into obsessions.
        </p>
        <h1 className="landing-hero__headline">
          Doughly Tempted?<br />Get It Crumbl!
        </h1>
        <div className="landing-hero__cta-row">
          <button className="landing-hero__btn-primary" onClick={() => navigate(ROUTES.LOGIN)}>
            Order Now
          </button>
          <button className="landing-hero__btn-secondary" onClick={() => navigate(ROUTES.LOGIN)}>
            Meet Cookie
          </button>
        </div>
      </section>
    </div>
  );
}
