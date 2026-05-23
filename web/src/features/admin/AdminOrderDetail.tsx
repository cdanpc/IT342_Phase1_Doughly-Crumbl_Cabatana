import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, FileText, Package, Truck, CreditCard, ChevronDown, User } from 'lucide-react';
import { getAdminOrderById, updateOrderStatus, quoteDeliveryFee } from '../../shared/api/orderApi';
import { formatPrice, formatDate, formatOrderStatus, getStatusFullText } from '../../shared/utils/formatters';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { ROUTES } from '../../shared/utils/routes';
import type { Order, OrderStatus } from '../../shared/types';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';
import StatusTimeline from '../../shared/components/StatusTimeline';
import ConfirmModal from '../../components/ui/ConfirmModal';
import './AdminOrderDetail.css';

const ALL_STATUSES: OrderStatus[] = [
  'ORDER_PLACED',
  'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PAYMENT_CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
];

function isPickupOrder(order: Order): boolean {
  return order.fulfillmentMethod === 'PICKUP' || (order.deliveryAddress?.startsWith('Pickup') ?? false);
}

function extractPaymentMethod(order: Order): string {
  if (order.paymentMethod) {
    const labels: Record<string, string> = {
      GCASH: 'GCash',
      MAYA: 'Maya',
      BANK_TRANSFER: 'Bank Transfer',
      CASH_ON_PICKUP: 'Cash on Pickup',
    };
    return labels[order.paymentMethod] ?? '';
  }
  const notes = order.deliveryNotes ?? '';
  const match = notes.match(/Payment Method: (.+)/);
  return match ? match[1] : '';
}

function getAdminNextStatus(status: string, isPickup: boolean): OrderStatus | null {
  switch (status) {
    case 'ORDER_PLACED':      return isPickup ? 'PREPARING' : null;
    case 'PAYMENT_CONFIRMED': return 'PREPARING';
    case 'PREPARING':         return isPickup ? 'READY' : 'OUT_FOR_DELIVERY';
    case 'READY':             return 'COMPLETED';
    case 'OUT_FOR_DELIVERY':  return 'COMPLETED';
    default:                  return null;
  }
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lastNotification } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [proofExpanded, setProofExpanded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus | ''>('');

  const fetchOrder = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await getAdminOrderById(Number(id));
      setOrder(data);
    } catch {
      if (!silent) {
        setOrder(null);
        toast.error('Failed to load order. Please try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!id || lastNotification?.orderId !== Number(id)) return;
    fetchOrder(true);
  }, [fetchOrder, id, lastNotification?.id, lastNotification?.orderId]);

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (!order || !id) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(Number(id), { status: newStatus });
      setOrder(updated);
      toast.success(`Status updated to: ${formatOrderStatus(newStatus)}`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleConfirmCancel() {
    if (!order || !id) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(Number(id), { status: 'CANCELLED', reason: cancelReason });
      setOrder(updated);
      setShowCancelModal(false);
      setCancelReason('');
      toast.success('Order cancelled.');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleQuoteDeliveryFee() {
    if (!order || !id) return;
    const fee = parseFloat(deliveryFeeInput);
    if (isNaN(fee) || fee < 0) {
      toast.error('Please enter a valid delivery fee amount');
      return;
    }
    setIsQuoting(true);
    try {
      const updated = await quoteDeliveryFee(Number(id), fee);
      setOrder(updated);
      setDeliveryFeeInput('');
      toast.success(`Delivery fee of ${formatPrice(fee)} quoted successfully`);
    } catch {
      toast.error('Failed to quote delivery fee');
    } finally {
      setIsQuoting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="od__loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="od__not-found">
        <p className="od__not-found-text">Order not found.</p>
        <button onClick={() => navigate(ROUTES.ADMIN_ORDERS)} className="od__btn od__btn--primary">
          Back to Orders
        </button>
      </div>
    );
  }

  const isPickup = isPickupOrder(order);
  const isCancelled = order.status === 'CANCELLED';
  const isTerminal = order.status === 'COMPLETED' || isCancelled;
  const isDeliveryQuoteStep = order.status === 'AWAITING_DELIVERY_QUOTE';
  const isPaymentSubmitted = order.status === 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION';
  const isWaitingForPayment = order.status === 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED';
  const nextStatus = getAdminNextStatus(order.status, isPickup);

  const paymentMethod = extractPaymentMethod(order);
  const itemsSubtotal = order.subtotalAmount ?? order.items.reduce((s, i) => s + i.subtotal, 0);
  const deliveryFee = order.deliveryFee ?? (order.totalAmount - itemsSubtotal);

  // Whether to show the standard advance button
  const showAdvanceBtn = !isTerminal && !isDeliveryQuoteStep && !isPaymentSubmitted && !isWaitingForPayment && !!nextStatus;

  return (
    <div className="od">

      {/* Back */}
      <button className="od__back" onClick={() => navigate(ROUTES.ADMIN_ORDERS)}>
        <ArrowLeft size={15} /> Back to Orders
      </button>

      {/* ── Full-width header card ── */}
      <div className="od__header-card">
        <div className="od__header-left">
          <div className="od__header-title-row">
            <h2 className="od__title">Order #{order.orderId}</h2>
            <span className={`od__badge ${isPickup ? 'od__badge--pickup' : 'od__badge--delivery'}`}>
              {isPickup ? 'PICKUP' : 'DELIVERY'}
            </span>
          </div>
          <span className="od__date">{formatDate(order.orderDate)}</span>
        </div>
        <span title={getStatusFullText(order.status) || undefined} className="od__status-chip-wrap">
          <OrderStatusBadge status={order.status} />
        </span>
      </div>

      {/* ── Two-column grid ── */}
      <div className="od__grid">

        {/* LEFT COLUMN — vertical status tracker + action buttons */}
        <div className="od__col-left">
          <div className="od__timeline-card">
            <h3 className="od__card-title">Order Progress</h3>
            <StatusTimeline
              currentStatus={order.status}
              isCancelled={isCancelled}
              flowType={isPickup ? 'pickup' : 'delivery'}
            />
          </div>

          {/* Advance + Cancel — below the timeline */}
          {!isTerminal && (
            <div className="od__btn-row od__btn-row--col">
              {showAdvanceBtn && (
                <button
                  className="od__btn od__btn--primary"
                  onClick={() => handleStatusUpdate(nextStatus!)}
                  disabled={isUpdating}
                >
                  {nextStatus === 'OUT_FOR_DELIVERY' ? <Truck size={15} /> : <Package size={15} />}
                  {isUpdating ? 'Updating...' : `Move to: ${formatOrderStatus(nextStatus!)}`}
                </button>
              )}
              <button
                className="od__btn od__btn--cancel"
                onClick={() => setShowCancelModal(true)}
                disabled={isUpdating}
              >
                Cancel Order
              </button>
            </div>
          )}

          {/* ── Manual Status Override ── */}
          <div className="od__override">
            <button
              className="od__override-toggle"
              onClick={() => setShowOverride((v) => !v)}
            >
              Override Status
              <ChevronDown
                size={14}
                className={`od__override-chevron${showOverride ? ' od__override-chevron--open' : ''}`}
              />
            </button>
            {showOverride && (
              <div className="od__override-body">
                <p className="od__override-warning">
                  Force this order to any status, bypassing the normal flow. Use only to correct mistakes.
                </p>
                <div className="od__override-row">
                  <div className="od__override-select-wrap">
                    <select
                      className="od__override-select"
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value as OrderStatus)}
                    >
                      <option value="">Select target status…</option>
                      {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
                        <option key={s} value={s}>{formatOrderStatus(s)}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="od__override-select-icon" />
                  </div>
                  <button
                    className="od__btn od__btn--override"
                    disabled={!overrideStatus || isUpdating}
                    onClick={() => {
                      if (!overrideStatus) return;
                      if (overrideStatus === 'CANCELLED') {
                        setShowCancelModal(true);
                      } else {
                        handleStatusUpdate(overrideStatus);
                        setShowOverride(false);
                        setOverrideStatus('');
                      }
                    }}
                  >
                    {isUpdating ? 'Applying…' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — action panels + customer info + order items */}
        <div className="od__col-right">

          {/* Waiting for customer payment */}
          {isWaitingForPayment && (
            <div className="od__waiting-banner">
              <div className="spinner od__waiting-spinner" />
              <div>
                <div className="od__waiting-title">Waiting for Customer Payment</div>
                <p className="od__waiting-text">
                  Delivery fee has been sent to the customer. Waiting for them to submit payment proof.
                </p>
              </div>
            </div>
          )}

          {/* Quote delivery fee */}
          {isDeliveryQuoteStep && (
            <div className="od__action-panel od__action-panel--quote">
              <h4 className="od__action-title od__action-title--quote">Quote Delivery Fee</h4>
              <p className="od__action-desc">
                Enter the delivery fee for this order. The customer will be notified and asked to submit payment.
              </p>
              <div className="od__fee-row">
                <div className="od__fee-input-wrap">
                  <span className="od__fee-prefix">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryFeeInput}
                    onChange={(e) => setDeliveryFeeInput(e.target.value)}
                    className="od__fee-input"
                  />
                </div>
                <button
                  className="od__btn od__btn--quote"
                  onClick={handleQuoteDeliveryFee}
                  disabled={isQuoting || !deliveryFeeInput}
                >
                  {isQuoting ? 'Sending...' : 'Send Quote'}
                </button>
              </div>
            </div>
          )}

          {/* Confirm payment */}
          {isPaymentSubmitted && (
            <div className="od__action-panel od__action-panel--payment">
              <h4 className="od__action-title od__action-title--payment">Payment Proof Received</h4>
              {order.proofImageUrl ? (
                <div className="od__proof-img-wrap">
                  <p className="od__proof-label">Customer's submitted proof:</p>
                  <img
                    src={order.proofImageUrl}
                    alt="Proof of payment"
                    className="od__proof-img"
                    onClick={() => setProofExpanded(true)}
                  />
                  <p className="od__proof-hint">Click to enlarge</p>
                </div>
              ) : (
                <p className="od__payment-review-hint">
                  The customer has submitted proof of payment. Review and confirm below.
                </p>
              )}
              <button
                className="od__btn od__btn--confirm"
                onClick={() => handleStatusUpdate('PAYMENT_CONFIRMED')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Confirming...' : 'Confirm Payment'}
              </button>
            </div>
          )}

          {/* ── Customer / Fulfillment Info ── */}
          <div className="od__card">
            <h3 className="od__card-title">{isPickup ? 'Pickup Information' : 'Delivery Information'}</h3>
            <div className="od__info-list">
              {(order.customerName || order.customerEmail) && (
                <div className="od__info-item">
                  <User size={15} className="od__info-icon" />
                  <div>
                    <div className="od__info-label">Customer</div>
                    {order.customerName && <span>{order.customerName}</span>}
                    {order.customerEmail && <span className="od__info-sub">{order.customerEmail}</span>}
                  </div>
                </div>
              )}
              <div className="od__info-item">
                <MapPin size={15} className="od__info-icon" />
                <div>
                  <div className="od__info-label">{isPickup ? 'Location' : 'Address'}</div>
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>
              <div className="od__info-item">
                <Phone size={15} className="od__info-icon" />
                <div>
                  <div className="od__info-label">Contact</div>
                  <span>{order.contactNumber}</span>
                </div>
              </div>
              {paymentMethod && (
                <div className="od__info-item">
                  <CreditCard size={15} className="od__info-icon" />
                  <div>
                    <div className="od__info-label">Payment Method</div>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              )}
              {order.cancellationReason && (
                <div className="od__info-item">
                  <FileText size={15} className="od__info-icon od__info-icon--error" />
                  <div>
                    <div className="od__info-label od__info-label--error">Cancellation Reason</div>
                    <span className="od__cancel-reason">{order.cancellationReason}</span>
                  </div>
                </div>
              )}
            </div>

            {!isPickup && (
              <div className="od__proof-section">
                <div className="od__proof-section-label">
                  <FileText size={13} />
                  Proof of Payment
                </div>
                {order.proofImageUrl ? (
                  <>
                    <img
                      src={order.proofImageUrl}
                      alt="Proof of payment"
                      className="od__proof-full"
                      onClick={() => setProofExpanded(true)}
                    />
                    <p className="od__proof-hint">Click to enlarge</p>
                  </>
                ) : (
                  <p className="od__proof-empty">No payment proof submitted yet.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Order Items ── */}
          <div className="od__card">
            <h3 className="od__card-title">Order Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="od__item-row">
                <div className="od__item-info">
                  <span className="od__item-name">{item.productName}</span>
                  <span className="od__item-meta">Qty {item.quantity} × {formatPrice(item.unitPrice)}</span>
                </div>
                <span className="od__item-price">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <hr className="od__divider" />
            <div className="od__total-row">
              <span>Items subtotal</span>
              <span>{formatPrice(itemsSubtotal)}</span>
            </div>
            {!isPickup && order.status !== 'AWAITING_DELIVERY_QUOTE' && deliveryFee > 0 && (
              <div className="od__total-row">
                <span>Delivery fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="od__grand-total">
              <span>Total</span>
              <span className="od__grand-total-price">{formatPrice(order.totalAmount)}</span>
            </div>
            {!isPickup && order.status === 'AWAITING_DELIVERY_QUOTE' && (
              <p className="od__fee-note">* Total shown is items subtotal. Delivery fee will be added after quoting.</p>
            )}
          </div>

        </div>{/* end col-right */}
      </div>{/* end grid */}

      {/* ── Cancel Modal ── */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => { if (!isUpdating) { setShowCancelModal(false); setCancelReason(''); } }}
        onConfirm={handleConfirmCancel}
        title={`Cancel Order #${order.orderId}`}
        description="Provide a reason for cancellation (optional). The customer will see this."
        confirmLabel="Confirm Cancel"
        cancelLabel="Go Back"
        isDanger
        isConfirming={isUpdating}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g. Item out of stock, unable to fulfil order..."
          rows={3}
          className="od__modal-textarea"
        />
      </ConfirmModal>

      {/* ── Proof Lightbox ── */}
      {proofExpanded && order.proofImageUrl && (
        <div className="od__lightbox" onClick={() => setProofExpanded(false)}>
          <img
            src={order.proofImageUrl}
            alt="Proof of payment"
            className="od__lightbox-img"
          />
          <p className="od__lightbox-hint">Click anywhere to close</p>
        </div>
      )}

    </div>
  );
}
