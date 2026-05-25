import { ArrowRight, Clock3, PackageCheck, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import menuCookies from '../../assets/products/menu-cookie-group.png';
import './MenuComponents.css';

interface MenuHeroProps {
  onOrderNow: () => void;
}

export default function MenuHero({ onOrderNow }: MenuHeroProps) {
  return (
    <section className="menu-hero-v2">
      <div className="menu-hero-v2__copy">
        <p className="menu-hero-v2__kicker">
          <Sparkles size={16} />
          Fresh batch ordering
        </p>
        <h1>Freshly baked happiness, made for your next craving.</h1>
        <p>
          Browse Doughly Crumbl cookies, add your favorites to the bag, and checkout with pickup or delivery details ready.
        </p>
        <div className="menu-hero-v2__actions">
          <Button onClick={onOrderNow}>
            Start ordering <ArrowRight size={18} />
          </Button>
        </div>
      </div>
      <div className="menu-hero-v2__visual">
        <img
          className="menu-hero-v2__image"
          src={menuCookies}
          alt="A spread of freshly baked Doughly Crumbl cookies"
        />
      </div>
      <div className="menu-hero-v2__meta">
        <span><Clock3 size={17} /> Baked to order</span>
        <span><PackageCheck size={17} /> Pickup or delivery</span>
      </div>
    </section>
  );
}
