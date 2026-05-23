import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/utils/routes';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import PageContainer from './PageContainer';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="site-navbar">
      <PageContainer className="site-navbar__inner">
        <button className="site-navbar__brand" onClick={() => navigate(ROUTES.LANDING)} aria-label="Go to Doughly Crumbl home">
          <Logo variant="red" />
        </button>

        <nav className="site-navbar__links" aria-label="Landing page sections">
          <a href="#featured">Featured</a>
          <a href="#why-us">Why us</a>
          <a href="#freshness">Freshness</a>
        </nav>

        <div className="site-navbar__actions">
          <Button variant="ghost" onClick={() => navigate(ROUTES.LOGIN)}>
            Sign in
          </Button>
          <Button variant="primary" onClick={() => navigate(ROUTES.REGISTER)}>
            Create account
          </Button>
        </div>
      </PageContainer>
    </header>
  );
}
