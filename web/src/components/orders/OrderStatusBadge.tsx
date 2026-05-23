import type { OrderStatus } from '../../shared/types';
import { formatOrderStatus } from '../../shared/utils/formatters';
import Badge from '../ui/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
}

function getTone(status: string) {
  if (['COMPLETED', 'DELIVERED', 'READY'].includes(status)) return 'success';
  if (['ORDER_PLACED', 'AWAITING_DELIVERY_QUOTE', 'PENDING'].includes(status)) return 'warning';
  if (['CANCELLED'].includes(status)) return 'danger';
  if (['PAYMENT_SUBMITTED_AWAITING_CONFIRMATION', 'PAYMENT_CONFIRMED', 'OUT_FOR_DELIVERY', 'PREPARING', 'CONFIRMED'].includes(status)) return 'info';
  return 'default';
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge tone={getTone(status)}>{formatOrderStatus(status)}</Badge>;
}
