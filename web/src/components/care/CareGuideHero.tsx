import { Clock3, Flame, Snowflake } from 'lucide-react';
import './CareComponents.css';

export default function CareGuideHero() {
  return (
    <section className="care-hero">
      <p className="care-hero__eyebrow">Cookie care guide</p>
      <h1>Keep your cookies soft, warm, and ready for later.</h1>
      <p>Everything you need to know about storing, reheating, and enjoying Doughly Crumbl cookies at their best.</p>
      <div className="care-hero__stats">
        <span><Clock3 size={18} /> 1 week shelf life</span>
        <span><Flame size={18} /> 8-10 sec microwave</span>
        <span><Snowflake size={18} /> Up to 2 months frozen</span>
      </div>
    </section>
  );
}
