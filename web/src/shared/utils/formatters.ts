/**
 * Format price in Philippine Peso
 */
export function formatPrice(amount: number): string {
  return `₱${amount.toFixed(2)} PHP`;
}

/**
 * Format date string to readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Non-terminal order statuses that warrant background polling / live refresh */
export const ACTIVE_ORDER_STATUSES = [
  'ORDER_PLACED',
  'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PAYMENT_CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'READY',
] as const;

export function formatOrderStatus(status: string): string {
  switch (status) {
    case 'ORDER_PLACED':      return 'Order Placed';
    case 'AWAITING_DELIVERY_QUOTE': return 'Getting Quote';
    case 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED': return 'Payment Due';
    case 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION': return 'Confirming';
    case 'PAYMENT_CONFIRMED': return 'Payment Confirmed';
    case 'PREPARING':         return 'Preparing';
    case 'OUT_FOR_DELIVERY':  return 'On the Way';
    case 'COMPLETED':         return 'Completed';
    default:
      return status
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

/** Returns the original long-form text for the 4 shortened statuses.
 *  Empty string for all others (tooltip omitted when no extra context). */
export function getStatusFullText(status: string): string {
  switch (status) {
    case 'AWAITING_DELIVERY_QUOTE':          return 'Awaiting Delivery Quote';
    case 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED': return 'Delivery Fee Quoted — Payment Required';
    case 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION': return 'Payment Submitted — Awaiting Confirmation';
    case 'OUT_FOR_DELIVERY':                 return 'Out for Delivery';
    default: return '';
  }
}

export function getOrderStatusHelperText(status: string): string {
  switch (status) {
    case 'ORDER_PLACED':
      return 'Your order has been placed and is awaiting seller confirmation.';
    case 'AWAITING_DELIVERY_QUOTE':
      return "Seller is calculating your delivery fee. You'll be notified here once it's ready.";
    case 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED':
      return 'Delivery fee has been confirmed. Please review the total and submit your payment.';
    case 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION':
      return "We've received your proof of payment and are verifying it. Hang tight!";
    case 'PAYMENT_CONFIRMED':
      return 'Payment verified! Your order is now being prepared.';
    case 'PREPARING':
      return 'Your order is being freshly prepared.';
    case 'OUT_FOR_DELIVERY':
      return "Your order is on its way! The rider is heading to your location.";
    case 'READY':
      return 'Your order is ready! Please come to the store to pick it up.';
    case 'COMPLETED':
      return 'Order completed. Thank you for choosing Doughly Crumbl!';
    case 'CANCELLED':
      return 'This order has been cancelled.';
    default:
      return '';
  }
}
