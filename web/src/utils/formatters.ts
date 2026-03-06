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
    case 'PENDING':
      return '#F59E0B';
    case 'CONFIRMED':
      return '#3B82F6';
    case 'PREPARING':
      return '#8B5CF6';
    case 'READY':
      return '#10B981';
    case 'DELIVERED':
      return '#16A34A';
    case 'CANCELLED':
      return '#DC2626';
    default:
      return '#666666';
  }
}

/**
 * Truncate text to N characters
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
