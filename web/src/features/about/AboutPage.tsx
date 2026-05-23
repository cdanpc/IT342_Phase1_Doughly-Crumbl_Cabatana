import AboutHero from '../../components/about/AboutHero';
import ContactCards from '../../components/about/ContactCards';
import FaqSection, { type FaqItem } from '../../components/about/FaqSection';
import SectionHeader from '../../components/layout/SectionHeader';
import './AboutPage.css';

const faqs: FaqItem[] = [
  {
    question: 'Where are you located?',
    answer: 'Doughly Crumbl is located at Don Gil Garcia St., Capitol Site, Cebu City. We do not have a physical store yet. You can place your order through our online menu for pickup or to arrange delivery.',
  },
  {
    question: 'What are your pickup days and times?',
    answer: <>Pickup schedules may vary. Please check the home page or product description for the most up-to-date pickup availability. You can also reach us directly at <strong>09165667589</strong>.</>,
  },
  {
    question: 'How does delivery work?',
    answer: 'We use on-demand couriers such as Lalamove and Borzo. Delivery fees depend on your exact location, so we calculate the fee after you place your order.',
  },
  {
    question: "What if I can't make it on the scheduled pickup day?",
    answer: <>Reach out via Facebook, Instagram, or call/text <strong>09165667589</strong> and we will do our best to find a schedule that works.</>,
  },
  {
    question: 'Why do flavors rotate?',
    answer: 'Our production is made-to-order. We rotate flavors weekly based on availability and seasonality to keep every product at our quality standard.',
  },
  {
    question: 'Is there a minimum order quantity?',
    answer: 'Yes. Our minimum cookie order is 4 units. This helps us maintain quality and efficiency for every order.',
  },
  {
    question: 'Are your products freshly baked?',
    answer: 'Absolutely. Cookies and brownies are baked at the time your order is placed, so pickup orders are practically fresh out of the oven.',
  },
  {
    question: 'What ingredients do you use?',
    answer: 'Fresh, high-quality ingredients with no preservatives. Depending on the variety, ingredients may include butter, vegetable shortening, sugar, eggs, wheat flour, cocoa, spices, chocolate, nuts, dairy, dehydrated fruits, and salt.',
  },
  {
    question: 'Do you offer vegan or gluten-free options?',
    answer: 'We do not offer vegan or gluten-free products at this time.',
  },
  {
    question: 'When do I pay?',
    answer: 'You pay after the delivery fee has been quoted and added to your total. Payment instructions are shown in your order details.',
  },
  {
    question: 'Can I pay cash?',
    answer: 'Cash payment is available for pickup orders only. Delivery orders require cashless payment so payment can be confirmed before dispatch.',
  },
  {
    question: 'Allergy information',
    answer: 'Our production area processes wheat, eggs, dairy, tree nuts, and soy. We take precautions, but we are not an allergen-free environment.',
  },
  {
    question: 'Do you participate in events or pop-up shops?',
    answer: 'Yes. Follow us on Facebook and Instagram to stay updated on upcoming events, bazaars, and pop-up shops in Cebu.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <AboutHero />

      <section className="about-section">
        <SectionHeader
          eyebrow="Find us"
          title="Contact Doughly Crumbl"
          description="We are online-first, so orders are placed through the app for pickup or delivery arrangements."
        />
        <ContactCards />
      </section>

      <section className="about-section">
        <SectionHeader
          eyebrow="FAQ"
          title="Before you order"
          description="The most common ordering, pickup, payment, and ingredient questions in one place."
        />
        <FaqSection items={faqs} />
      </section>

      <div className="about-footer-note">
        Still have questions? Message us on Facebook or Instagram, or call/text <strong>09165667589</strong>. We are happy to help.
      </div>
    </div>
  );
}
