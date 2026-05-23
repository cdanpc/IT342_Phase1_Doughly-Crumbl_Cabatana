import { MapPin } from 'lucide-react';
import Logo from '../ui/Logo';
import './AboutComponents.css';

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div>
        <Logo variant="red" />
        <h1>Home-based artisan cookies, baked fresh in Cebu.</h1>
        <p>
          Doughly Crumbl delivers freshly baked happiness one cookie at a time, using high-quality, preservative-free ingredients and a made-to-order process.
        </p>
        <span><MapPin size={17} /> Don Gil Garcia St., Capitol Site, Cebu City</span>
      </div>
    </section>
  );
}
