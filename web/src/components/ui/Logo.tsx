import redLogo from '../../assets/brand/doughly-crumbl-red-logo.png';
import whiteLogo from '../../assets/brand/doughly-crumbl-white-logo.png';
import './Logo.css';

interface LogoProps {
  variant?: 'red' | 'white';
  showText?: boolean;
  className?: string;
}

export default function Logo({ variant = 'red', showText = true, className = '' }: LogoProps) {
  const logoSrc = variant === 'white' ? whiteLogo : redLogo;

  return (
    <span className={`brand-logo brand-logo--${variant} ${className}`}>
      <img className="brand-logo__mark" src={logoSrc} alt="" aria-hidden="true" />
      {showText && <span className="brand-logo__text">Doughly Crumbl</span>}
    </span>
  );
}
