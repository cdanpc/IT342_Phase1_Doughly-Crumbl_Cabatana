import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import PageContainer from '../layout/PageContainer';
import './LandingSections.css';

const cookies = [
  {
    name: 'Classic Crumbl',
    description: 'Soft center, crisp edges, and a chocolatey finish.',
    tone: 'choco',
  },
  {
    name: 'Red Velvet Bite',
    description: 'A rich bakery favorite with a smooth, creamy mood.',
    tone: 'red',
  },
  {
    name: 'Golden Brownie',
    description: 'Dense, fudgy, and packed for serious dessert cravings.',
    tone: 'cream',
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
                <span className={`cookie-art cookie-art--${cookie.tone}`} />
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
