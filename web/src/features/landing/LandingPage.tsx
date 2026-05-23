import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import CallToAction from '../../components/landing/CallToAction';
import FeaturedCookies from '../../components/landing/FeaturedCookies';
import HeroSection from '../../components/landing/HeroSection';
import WhyChooseUs from '../../components/landing/WhyChooseUs';
import { ROUTES } from '../../shared/utils/routes';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const goToLogin = () => navigate(ROUTES.LOGIN);
  const goToRegister = () => navigate(ROUTES.REGISTER);

  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <HeroSection onOrderNow={goToLogin} onCreateAccount={goToRegister} />
        <FeaturedCookies onOrderNow={goToLogin} />
        <WhyChooseUs />
        <CallToAction onOrderNow={goToLogin} onRegister={goToRegister} />
      </main>
    </div>
  );
}
