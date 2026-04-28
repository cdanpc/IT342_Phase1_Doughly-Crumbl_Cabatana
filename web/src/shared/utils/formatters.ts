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

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ORDER_PLACED':
      return '#F59E0B';
    case 'AWAITING_DELIVERY_QUOTE':
      return '#F59E0B';
    case 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED':
      return '#EA580C';
    case 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION':
      return '#3B82F6';
    case 'PAYMENT_CONFIRMED':
      return '#0891B2';
    case 'PENDING':
      return '#F59E0B';
    case 'CONFIRMED':
      return '#3B82F6';
    case 'PREPARING':
      return '#8B5CF6';
    case 'OUT_FOR_DELIVERY':
      return '#2563EB';
    case 'READY':
      return '#10B981';
    case 'DELIVERED':
    case 'COMPLETED':
      return '#16A34A';
    case 'CANCELLED':
      return '#DC2626';
    default:
      return '#666666';
  }
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case 'ORDER_PLACED':
      return 'Order Placed';
    case 'AWAITING_DELIVERY_QUOTE':
      return 'Awaiting Delivery Quote';
    case 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED':
      return 'Delivery Fee Quoted — Payment Required';
    case 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION':
      return 'Payment Submitted — Awaiting Confirmation';
    case 'PAYMENT_CONFIRMED':
      return 'Payment Confirmed';
    case 'PREPARING':
      return 'Preparing';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
