// Shared order status flow data — imported by OrderDetailPage, AdminOrderDetail

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
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready for Pickup' },
  { status: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {timeline.map((step, idx) => {
        const done = !isCancelled && idx <= currentIdx;
        const current = idx === currentIdx && !isCancelled;
        return (
          <div
            key={step.status}
            style={{ display: 'flex', gap: 12, paddingBottom: idx < timeline.length - 1 ? 14 : 0 }}
          >
            {/* Dot + connecting line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
              <div
                style={{
                  width: current ? 14 : 10,
                  height: current ? 14 : 10,
                  borderRadius: '50%',
                  background: done ? 'var(--color-primary)' : 'var(--color-border)',
                  border: current ? '2.5px solid var(--color-primary)' : 'none',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  marginTop: current ? 1 : 3,
                }}
              />
              {idx < timeline.length - 1 && (
                <div
                  style={{
                    flex: 1, width: 2,
                    background: done ? 'var(--color-primary)' : 'var(--color-border)',
                    marginTop: 4,
                    opacity: done ? 1 : 0.3,
                  }}
                />
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: 13,
                fontWeight: current ? 700 : 400,
                color: done ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                paddingBottom: 2,
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}

      {isCancelled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>Cancelled</span>
        </div>
      )}
    </div>
  );
}
