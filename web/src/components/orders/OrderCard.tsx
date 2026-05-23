import { ChevronRight, Clock3, ReceiptText } from 'lucide-react';
import type { Order } from '../../shared/types';
import { formatDate, formatPrice, getOrderStatusHelperText, getStatusFullText } from '../../shared/utils/formatters';
import Card from '../ui/Card';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderComponents.css';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const helper = getOrderStatusHelperText(order.status);
  const statusTitle = getStatusFullText(order.status) || undefined;
  const itemSummary = order.items?.slice(0, 2).map((item) => `${item.quantity}x ${item.productName}`).join(', ');
  const extraItems = order.items && order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

  return (
    <Card interactive className="order-card-v2" onClick={onClick}>
      <div className="order-card-v2__top">
        <div className="order-card-v2__identity">
          <span className="order-card-v2__icon"><ReceiptText size={20} /></span>
          <div>
            <h3>Order #{order.orderId}</h3>
            <p><Clock3 size={14} /> {formatDate(order.orderDate)}</p>
          </div>
        </div>
        <span title={statusTitle}>
          <OrderStatusBadge status={order.status} />
        </span>
      </div>

      {helper && <p className="order-card-v2__helper">{helper}</p>}

      <div className="order-card-v2__bottom">
        <span className="order-card-v2__items">{itemSummary || 'Cookie order'}{extraItems}</span>
        <strong>{formatPrice(order.totalAmount)}</strong>
        <ChevronRight size={20} className="order-card-v2__chevron" />
      </div>
    </Card>
  );
}
