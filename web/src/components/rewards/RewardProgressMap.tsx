import { Award, CheckCircle, Lock } from 'lucide-react';
import './RewardProgressMap.css';

interface RewardProgressMapProps {
  completedOrders: number;
}

const MERIT_MILESTONES = [
  { count: 1, label: 'New Crumbler' },
  { count: 3, label: 'Topping Ready' },
  { count: 5, label: 'Discount Ready' },
  { count: 10, label: 'Cookie Box' },
  { count: 15, label: 'VIP Crumbler' },
];

export default function RewardProgressMap({ completedOrders }: RewardProgressMapProps) {
  const nextMilestone = MERIT_MILESTONES.find((milestone) => completedOrders < milestone.count);
  const previousMilestone = [...MERIT_MILESTONES].reverse().find((milestone) => completedOrders >= milestone.count);
  const target = nextMilestone ?? MERIT_MILESTONES[MERIT_MILESTONES.length - 1];
  const previousCount = previousMilestone?.count ?? 0;
  const range = Math.max(target.count - previousCount, 1);
  const progress = nextMilestone
    ? Math.min(100, Math.max(0, ((completedOrders - previousCount) / range) * 100))
    : 100;
  const remaining = nextMilestone ? nextMilestone.count - completedOrders : 0;

  return (
    <section className="reward-map" aria-label="Reward progress">
      <div className="reward-map__header">
        <div className="reward-map__icon">
          <Award size={18} />
        </div>
        <div>
          <h3>Merit progress</h3>
          <p>
            {nextMilestone
              ? `${remaining} more completed order${remaining === 1 ? '' : 's'} until ${nextMilestone.label}.`
              : 'Top loyalty milestone reached. More admin-controlled rewards can be added later.'}
          </p>
        </div>
      </div>

      <div className="reward-map__count">
        <strong>{completedOrders}</strong>
        <span>completed order{completedOrders === 1 ? '' : 's'}</span>
      </div>

      <div className="reward-map__bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="reward-map__milestones">
        {MERIT_MILESTONES.map((milestone) => {
          const unlocked = completedOrders >= milestone.count;
          return (
            <div
              key={milestone.count}
              className={`reward-map__milestone ${unlocked ? 'reward-map__milestone--unlocked' : ''}`}
            >
              <span className="reward-map__milestone-icon">
                {unlocked ? <CheckCircle size={14} /> : <Lock size={14} />}
              </span>
              <strong>{milestone.count}</strong>
              <small>{milestone.label}</small>
            </div>
          );
        })}
      </div>

      <p className="reward-map__note">
        Reward rules are display-only until admin reward endpoints are added. Completed orders are the merit source.
      </p>
    </section>
  );
}
