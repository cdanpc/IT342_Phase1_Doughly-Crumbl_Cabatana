import { Facebook, Instagram, Phone, MapPin } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about__container">
        {/* Header */}
        <div className="about__header">
          <h1 className="about__title">About Doughly Crumbl</h1>
          <p className="about__intro">
            We are a home-based artisan bakery passionate about delivering freshly baked happiness — one cookie at a time. 
            Every product is crafted by hand using high-quality, preservative-free ingredients, baked to order so that what 
            reaches you is as fresh as it gets.
          </p>
          <p className="about__motto">
            <strong>Pickup Day is Baking Day.</strong>
          </p>
        </div>

        {/* Find Us Section */}
        <section className="about__section">
          <h2 className="about__section-title">Find Us</h2>
          <div className="about__contact-grid">
            <div className="about__contact-item">
              <MapPin size={20} className="about__icon" />
              <div>
                <h3 className="about__contact-label">Address</h3>
                <p className="about__contact-text">Don Gil Garcia St., Capitol Site, Cebu City</p>
              </div>
            </div>

            <div className="about__contact-item">
              <Phone size={20} className="about__icon" />
              <div>
                <h3 className="about__contact-label">Contact</h3>
                <p className="about__contact-text">09165667589</p>
              </div>
            </div>

            <div className="about__contact-item">
              <Facebook size={20} className="about__icon" />
              <div>
                <h3 className="about__contact-label">Facebook</h3>
                <p className="about__contact-text">Doughly Crumbl</p>
              </div>
            </div>

            <div className="about__contact-item">
              <Instagram size={20} className="about__icon" />
              <div>
                <h3 className="about__contact-label">Instagram</h3>
                <p className="about__contact-text">@doughlycrumbl</p>
              </div>
            </div>
          </div>

          <div className="about__note">
            <p>
              We do not have a physical store at this time. Orders are placed online for pickup or delivery arrangements.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="about__section">
          <h2 className="about__section-title">Frequently Asked Questions</h2>
          <div className="about__faq-list">
            {/* FAQ Item 1 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Where are you located?</h3>
              <p className="about__faq-answer">
                Doughly Crumbl is located at Don Gil Garcia St., Capitol Site, Cebu City. We do not have a physical store yet. 
                You can place your order through our online menu for pickup or to arrange delivery.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">What are your pickup days and times?</h3>
              <p className="about__faq-answer">
                Pickup schedules may vary. Please check the home page or the product description for the most up-to-date pickup 
                availability. You can also reach us directly at <strong>09165667589</strong> to confirm your preferred schedule.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">How does delivery work?</h3>
              <p className="about__faq-answer">
                We use on-demand couriers such as Lalamove and Borzo. Since delivery fees depend on your exact location,
                we calculate the fee after you place your order. Once confirmed, your updated total appears in My Orders
                before any payment is required.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">What if I can't make it on the scheduled pickup day?</h3>
              <p className="about__faq-answer">
                No problem. Reach out to us via Facebook, Instagram, or call/text <strong>09165667589</strong> and we will do our best 
                to find a schedule that works for both of us.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Why are some flavors available some weeks and not others?</h3>
              <p className="about__faq-answer">
                Our production is done on a daily, made-to-order basis. We rotate flavors weekly based on availability and seasonality 
                to ensure every product meets our quality standard. The menu typically updates every week — check back regularly for new 
                and returning flavors.
              </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Is there a minimum order quantity?</h3>
              <p className="about__faq-answer">
                Yes. Our minimum cookie order is <strong>4 units</strong>. This ensures we can maintain the quality and efficiency needed 
                for every order. Our Cinnamon Rolls, which require additional preparation time, are not available every week — when they 
                are, they sell out quickly.
              </p>
            </div>

            {/* FAQ Item 7 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Are your products freshly baked?</h3>
              <p className="about__faq-answer">
                Absolutely. Cookies and brownies are baked at the time your order is placed. When you pick up your order, everything is 
                practically fresh out of the oven.
              </p>
            </div>

            {/* FAQ Item 8 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">What ingredients do you use?</h3>
              <p className="about__faq-answer">
                All products are made with fresh, high-quality ingredients and contain no preservatives. Depending on the variety, 
                ingredients may include: butter, vegetable shortening, brown sugar, refined sugar, eggs, wheat flour, cocoa powder, 
                spices, chocolate, nuts, natural essences, leavening agents, dairy, dehydrated fruits, and salt.
              </p>
            </div>

            {/* FAQ Item 9 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Do you offer vegan or gluten-free options?</h3>
              <p className="about__faq-answer">
                We do not offer vegan or gluten-free products at this time.
              </p>
            </div>

            {/* FAQ Item 10 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">When do I pay?</h3>
              <p className="about__faq-answer">
                You pay after the delivery fee has been quoted and added to your total. Payment instructions (GCash, Maya,
                or bank transfer) are shown in your order details. Once you submit proof of payment, we verify before
                processing your order.
              </p>
            </div>

            {/* FAQ Item 11 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Can I pay cash?</h3>
              <p className="about__faq-answer">
                Cash payment is available for pickup orders only. Delivery orders require cashless payment (GCash, Maya,
                or bank transfer) so we can confirm payment before dispatching your order.
              </p>
            </div>

            {/* FAQ Item 12 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Allergy Information</h3>
              <p className="about__faq-answer">
                Our production area processes <strong>wheat, eggs, dairy, tree nuts, and soy</strong>. We take precautions to minimize 
                cross-contamination, but we are not an allergen-free environment. If you have a severe allergy, please contact us before 
                ordering.
              </p>
            </div>

            {/* FAQ Item 13 */}
            <div className="about__faq-item">
              <h3 className="about__faq-question">Do you participate in events or pop-up shops?</h3>
              <p className="about__faq-answer">
                Yes! We love connecting with our community and occasionally attend events, bazaars, and pop-up shops in Cebu. Follow us 
                on Facebook and Instagram to stay updated on upcoming appearances.
              </p>
            </div>
          </div>

          <div className="about__footer-note">
            <p>
              Still have questions? Message us on Facebook or Instagram, or call/text us at <strong>09165667589</strong>. 
              We are happy to help.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
