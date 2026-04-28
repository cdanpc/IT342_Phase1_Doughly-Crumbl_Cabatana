import './CareGuidePage.css';

export default function CareGuidePage() {
  return (
    <div className="care-guide-page">
      <div className="care-guide__container">
        {/* Header */}
        <div className="care-guide__header">
          <h1 className="care-guide__title">Cookie Care Guide</h1>
          <p className="care-guide__subtitle">
            Everything you need to know about storing, reheating, and enjoying your Doughly Crumbl cookies at their best.
          </p>
        </div>

        {/* Content Sections */}
        <div className="care-guide__content">
          {/* Shelf Life */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Shelf Life</h2>
            <p className="care-guide__text">
              Our cookies can be kept in their original sealed packaging for up to <strong>one (1) week</strong> at room temperature. 
              For best results, keep them in a cool, dry place away from direct sunlight.
            </p>
          </section>

          {/* Enjoying Warm & Soft */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Enjoying Warm & Soft Cookies</h2>
            <p className="care-guide__text">
              For that freshly-baked center softness, we recommend reheating before serving.
            </p>

            <div className="care-guide__subsection">
              <h3 className="care-guide__subsection-title">Microwave</h3>
              <p className="care-guide__text">
                Remove cookies from their packaging and heat for <strong>8–10 seconds</strong>. Best for a quick warm-up.
              </p>
            </div>

            <div className="care-guide__subsection">
              <h3 className="care-guide__subsection-title">Oven (Recommended)</h3>
              <p className="care-guide__text">
                Preheat your oven to <strong>350°F (180°C)</strong>. Place cookies directly on a baking tray (out of packaging) 
                and warm for <strong>4–5 minutes</strong>. This method best restores the original texture and aroma.
              </p>
            </div>
          </section>

          {/* Freezing & Long-Term Storage */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Freezing & Long-Term Storage</h2>

            <div className="care-guide__subsection">
              <h3 className="care-guide__subsection-title">To store:</h3>
              <p className="care-guide__text">
                Place cookies in their original sealed packaging, then transfer into an airtight container. 
                Freeze for up to <strong>2 months</strong>.
              </p>
            </div>

            <div className="care-guide__subsection">
              <h3 className="care-guide__subsection-title">To reheat from frozen:</h3>
              <p className="care-guide__text">
                Do not thaw. Place frozen cookies directly on a baking tray and bake in a preheated oven at <strong>350°F (180°C)</strong> 
                for <strong>8–10 minutes</strong>, or until heat has reached the center.
              </p>
            </div>
          </section>

          {/* Allergy Information */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Allergy Information</h2>
            <p className="care-guide__text">
              Our cookies are produced in a facility that processes the following ingredients:
            </p>
            <ul className="care-guide__list">
              <li>Wheat</li>
              <li>Eggs</li>
              <li>Dairy</li>
              <li>Tree Nuts</li>
              <li>Peanuts</li>
              <li>Soy</li>
            </ul>
            <div className="care-guide__warning">
              <p className="care-guide__text">
                While we take precautions to minimize cross-contamination, <strong>we cannot guarantee an allergen-free environment</strong> 
                as all equipment and utensils are shared across our full range of products.
              </p>
              <p className="care-guide__text">
                If you have a severe allergy, please contact us before placing an order.
              </p>
            </div>
          </section>

          {/* Ingredients */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Ingredients</h2>
            <p className="care-guide__text">
              All Doughly Crumbl products are made with <strong>high-quality, preservative-free, fresh ingredients</strong>. 
              Depending on the variety, our cookies may contain some or all of the following:
            </p>
            <p className="care-guide__text">
              Butter, vegetable shortening, brown sugar, refined sugar, eggs, wheat flour, cocoa powder, various spices, 
              chocolate, nuts, natural essences, leavening agents, dairy, dehydrated fruits, salt.
            </p>
          </section>

          {/* Dietary Options */}
          <section className="care-guide__section">
            <h2 className="care-guide__section-title">Dietary Options</h2>
            <p className="care-guide__text">
              At this time, we do not offer vegan or gluten-free products.
            </p>
          </section>

          {/* Contact Note */}
          <section className="care-guide__footer">
            <p className="care-guide__contact-note">
              For questions or concerns about ingredients, reach out to us at any of our channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
