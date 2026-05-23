import { Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import './AboutComponents.css';

const contacts = [
  { icon: MapPin, label: 'Address', value: 'Don Gil Garcia St., Capitol Site, Cebu City' },
  { icon: Phone, label: 'Contact', value: '09165667589' },
  { icon: Facebook, label: 'Facebook', value: 'Doughly Crumbl' },
  { icon: Instagram, label: 'Instagram', value: '@doughlycrumbl' },
];

export default function ContactCards() {
  return (
    <div className="contact-card-grid">
      {contacts.map((contact) => {
        const Icon = contact.icon;
        return (
          <article className="contact-card" key={contact.label}>
            <span><Icon size={21} /></span>
            <div>
              <h3>{contact.label}</h3>
              <p>{contact.value}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
