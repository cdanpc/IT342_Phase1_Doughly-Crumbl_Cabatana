import { Flame, Microwave, Snowflake } from 'lucide-react';
import './CareComponents.css';

const steps = [
  {
    icon: Microwave,
    title: 'Microwave',
    text: 'Remove cookies from packaging and heat for 8-10 seconds. Best for a quick warm-up.',
  },
  {
    icon: Flame,
    title: 'Oven',
    text: 'Preheat to 350°F (180°C), place cookies on a baking tray, and warm for 4-5 minutes.',
  },
  {
    icon: Snowflake,
    title: 'From frozen',
    text: 'Do not thaw. Bake frozen cookies at 350°F (180°C) for 8-10 minutes, or until warm at the center.',
  },
];

export default function ReheatingSteps() {
  return (
    <div className="reheating-steps">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article className="reheating-step" key={step.title}>
            <span className="reheating-step__number">{index + 1}</span>
            <Icon size={22} />
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        );
      })}
    </div>
  );
}
