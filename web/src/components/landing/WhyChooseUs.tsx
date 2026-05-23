import { BadgeCheck, PackageCheck, ReceiptText } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import './LandingSections.css';

const reasons = [
  {
    icon: BadgeCheck,
    title: 'Made to feel personal',
    description: 'Customer details, cart items, and order history stay connected after sign in.',
  },
  {
    icon: PackageCheck,
    title: 'Clear order flow',
    description: 'Checkout captures fulfillment and payment details so each order is easier to manage.',
  },
  {
    icon: ReceiptText,
    title: 'Trackable updates',
    description: 'Order status, payment proof, and notifications are all part of the same experience.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="landing-section landing-section--soft" id="why-us">
      <PageContainer>
        <div className="why-grid">
          <div className="landing-section__heading landing-section__heading--left">
            <p className="landing-kicker">Why choose us</p>
            <h2>A calmer way to order cookies from a home-based bakery.</h2>
            <p>
              The site is designed around the real Doughly Crumbl workflow: browse treats, place an order, submit proof, and follow status updates.
            </p>
          </div>

          <div className="why-card-grid">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <article className="why-card" key={reason.title}>
                  <span className="why-card__icon"><Icon size={22} /></span>
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
