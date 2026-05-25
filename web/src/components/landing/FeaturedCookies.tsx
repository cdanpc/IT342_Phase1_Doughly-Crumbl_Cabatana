import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import PageContainer from '../layout/PageContainer';
import whiteChocolateCookie from '../../assets/products/featured-cookie-white-chocolate.png';
import chocolateChipCookie from '../../assets/products/featured-cookie-chocolate-chip.png';
import redVelvetCookie from '../../assets/products/featured-cookie-red-velvet.png';
import './LandingSections.css';

const cookies = [
  {
    name: 'Classic White Chocolate',
    description: 'Buttery dough loaded with creamy white chocolate chips.',
    image: whiteChocolateCookie,
  },
  {
    name: 'Classic Chocolate Chip',
    description: 'The timeless bite — soft center, crisp edges, rich chocolate chips.',
    image: chocolateChipCookie,
  },
  {
    name: 'Red Velvet',
    description: 'A rich bakery favorite with white chips and a smooth, creamy mood.',
    image: redVelvetCookie,
  },
];

interface FeaturedCookiesProps {
  onOrderNow: () => void;
}

export default function FeaturedCookies({ onOrderNow }: FeaturedCookiesProps) {
  return (
    <section className="landing-section" id="featured">
      <PageContainer>
        <div className="landing-section__heading">
          <p className="landing-kicker">Featured cookies</p>
          <h2>Build a box that feels freshly made, not randomly picked.</h2>
          <p>Use Doughly Crumbl to move from browsing to checkout with real order tracking after you sign in.</p>
        </div>

        <div className="featured-cookie-grid">
          {cookies.map((cookie) => (
            <article className="featured-cookie-card" key={cookie.name}>
              <div className="featured-cookie-card__visual">
                <img
                  className="featured-cookie-card__image"
                  src={cookie.image}
                  alt={cookie.name}
                />
              </div>
              <div className="featured-cookie-card__body">
                <h3>{cookie.name}</h3>
                <p>{cookie.description}</p>
                <button type="button" onClick={onOrderNow}>
                  Add to cart <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="landing-section__center-action">
          <Button onClick={onOrderNow}>Browse the menu</Button>
        </div>
      </PageContainer>
    </section>
  );
}
