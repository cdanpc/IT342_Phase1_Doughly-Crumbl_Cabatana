import { AlertTriangle, Cookie, Leaf, PackageCheck, Snowflake } from 'lucide-react';
import CareGuideHero from '../../components/care/CareGuideHero';
import CareTipCard from '../../components/care/CareTipCard';
import ReheatingSteps from '../../components/care/ReheatingSteps';
import SectionHeader from '../../components/layout/SectionHeader';
import './CareGuidePage.css';

export default function CareGuidePage() {
  return (
    <div className="care-guide-page">
      <CareGuideHero />

      <section className="care-guide-section">
        <SectionHeader
          eyebrow="Storage"
          title="Store your box the right way"
          description="Keep cookies sealed and away from heat or direct sunlight for the best texture."
        />
        <div className="care-tip-grid">
          <CareTipCard icon={<PackageCheck size={22} />} title="Shelf life">
            <p>Cookies can be kept in their original sealed packaging for up to <strong>one (1) week</strong> at room temperature.</p>
          </CareTipCard>
          <CareTipCard icon={<Snowflake size={22} />} title="Long-term storage">
            <p>Place cookies in their original sealed packaging, transfer into an airtight container, and freeze for up to <strong>2 months</strong>.</p>
          </CareTipCard>
          <CareTipCard icon={<Cookie size={22} />} title="Best serving">
            <p>For that freshly-baked center softness, reheat before serving and enjoy while warm.</p>
          </CareTipCard>
        </div>
      </section>

      <section className="care-guide-section">
        <SectionHeader
          eyebrow="Reheating"
          title="Warm, soft, and ready to enjoy"
          description="Use the microwave for speed or the oven for the best restored texture and aroma."
        />
        <ReheatingSteps />
      </section>

      <section className="care-guide-section">
        <SectionHeader
          eyebrow="Ingredients and allergies"
          title="Fresh ingredients, clear warnings"
          description="All Doughly Crumbl products are made with high-quality, preservative-free ingredients."
        />
        <div className="care-tip-grid">
          <CareTipCard icon={<Leaf size={22} />} title="Ingredients">
            <p>Depending on the variety, cookies may contain butter, vegetable shortening, brown sugar, refined sugar, eggs, wheat flour, cocoa powder, spices, chocolate, nuts, natural essences, leavening agents, dairy, dehydrated fruits, and salt.</p>
          </CareTipCard>
          <CareTipCard icon={<AlertTriangle size={22} />} title="Allergy information">
            <p>Our cookies are produced in a facility that processes:</p>
            <ul>
              <li>Wheat</li>
              <li>Eggs</li>
              <li>Dairy</li>
              <li>Tree nuts</li>
              <li>Peanuts</li>
              <li>Soy</li>
            </ul>
          </CareTipCard>
          <CareTipCard icon={<AlertTriangle size={22} />} title="Dietary options">
            <p>At this time, we do not offer vegan or gluten-free products. If you have a severe allergy, please contact us before ordering.</p>
          </CareTipCard>
        </div>
      </section>

      <div className="care-guide-footer">
        While we take precautions to minimize cross-contamination, we cannot guarantee an allergen-free environment because equipment and utensils are shared across our full range of products.
      </div>
    </div>
  );
}
