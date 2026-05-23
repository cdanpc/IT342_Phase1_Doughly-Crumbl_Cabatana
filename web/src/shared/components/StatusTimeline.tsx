// Shared order status flow data — imported by OrderDetailPage, AdminOrderDetail
import './StatusTimeline.css';

const DELIVERY_STEPS = [
  { status: 'AWAITING_DELIVERY_QUOTE', label: 'Awaiting Delivery Quote' },
  { status: 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED', label: 'Delivery Fee Quoted — Payment Required' },
  { status: 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION', label: 'Payment Submitted' },
  { status: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'COMPLETED', label: 'Completed' },
];

const PICKUP_STEPS = [
  { status: 'ORDER_PLACED', label: 'Order Placed' },
  { status: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready for Pickup' },
  { status: 'COMPLETED', label: 'Completed' },
];

// Raw status arrays for components that only need the ordered list (e.g. AdminOrderDetail)
export const DELIVERY_FLOW = DELIVERY_STEPS.map((s) => s.status);
export const PICKUP_FLOW = PICKUP_STEPS.map((s) => s.status);

interface StatusTimelineProps {
  currentStatus: string;
  isCancelled: boolean;
  flowType: 'delivery' | 'pickup';
}

export default function StatusTimeline({ currentStatus, isCancelled, flowType }: StatusTimelineProps) {
  const timeline = flowType === 'pickup' ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIdx = timeline.findIndex((s) => s.status === currentStatus);

  return (
    <div className="status-timeline">
      {timeline.map((step, idx) => {
        const done = !isCancelled && idx <= currentIdx;
        const current = idx === currentIdx && !isCancelled;
        const dotClass = `status-timeline__dot${current ? ' status-timeline__dot--current' : done ? ' status-timeline__dot--done' : ''}`;
        const lineClass = `status-timeline__line${done ? ' status-timeline__line--done' : ''}`;
        const labelClass = `status-timeline__label${current ? ' status-timeline__label--current' : done ? ' status-timeline__label--done' : ''}`;
        return (
          <div key={step.status} className={`status-timeline__step${idx === timeline.length - 1 ? ' status-timeline__step--last' : ''}`}>
            <div className="status-timeline__track">
              <div className={dotClass} />
              {idx < timeline.length - 1 && <div className={lineClass} />}
            </div>
            <span className={labelClass}>{step.label}</span>
          </div>
        );
      })}

      {isCancelled && (
        <div className="status-timeline__cancelled">
          <div className="status-timeline__cancelled-dot" />
          <span className="status-timeline__cancelled-label">Cancelled</span>
        </div>
      )}
    </div>
  );
}
