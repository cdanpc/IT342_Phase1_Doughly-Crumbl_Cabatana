import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, FileText, Clock, CheckCircle, Package, Truck, CreditCard, X } from 'lucide-react';
import { getOrderById, submitPayment, cancelOrder } from '../../shared/api/orderApi';
import {
  formatPrice,
  formatDate,
  formatOrderStatus,
  getStatusFullText,
  getOrderStatusHelperText,
  ACTIVE_ORDER_STATUSES,
} from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import type { Order } from '../../shared/types';
import { useCart } from '../../shared/hooks/CartContext';
import { useNotifications } from '../../shared/hooks/NotificationContext';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';
import ProofUploadForm from '../../shared/components/ProofUploadForm';
import StatusTimeline from '../../shared/components/StatusTimeline';
import ConfirmModal from '../../components/ui/ConfirmModal';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import './OrderDetailPage.css';

function isPickupOrder(order: Order): boolean {
  return order.fulfillmentMethod === 'PICKUP' || order.deliveryAddress?.startsWith('Pickup');
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
  const notes = order.deliveryNotes;
  const match = notes?.match(/Payment Method: ([^|]+)/);
  return match ? match[1].trim() : '';
}

const QR_MAP: Record<string, string> = {
  GCash: '/gcash-qr.jpg',
  Maya: '/maya-qr.jpg',
  'Bank Transfer': '/bpi-qr.jpg',
};

const ACCOUNT_DETAILS: Record<string, { label: string; value: string }[]> = {
  GCash: [
    { label: 'Name', value: 'Doughly Crumbl' },
    { label: 'Number', value: '0916 566 7589' },
  ],
  Maya: [
    { label: 'Name', value: 'Chris Daniel Cabataña' },
    { label: 'Username', value: '@cdanpc' },
  ],
  'Bank Transfer': [
    { label: 'Bank', value: 'BPI' },
    { label: 'Name', value: 'Briana' },
    { label: 'Account', value: 'xxxxxxxxxx521' },
  ],
};

const DELIVERY_PAYMENT_TABS = ['GCash', 'Maya', 'Bank Transfer'];

function getHelperBannerClass(status: string): string {
  if (['COMPLETED', 'READY', 'DELIVERED'].includes(status)) return 'cod__helper--success';
  if (['DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED'].includes(status)) return 'cod__helper--orange';
  if (['CANCELLED'].includes(status)) return 'cod__helper--error';
  if (['AWAITING_DELIVERY_QUOTE', 'PENDING'].includes(status)) return 'cod__helper--warning';
  return 'cod__helper--info';
}


export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openOrderPanel } = useCart();
  const { lastNotification } = useNotifications();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = useState<string | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalTab, setModalTab] = useState('GCash');
  const [modalQrExpanded, setModalQrExpanded] = useState(false);

  const prevStatusRef = useRef<string>('');

  const fetchOrder = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await getOrderById(Number(id));
      if (prevStatusRef.current && data.status !== prevStatusRef.current) {
        toast.success(`Order update: ${formatOrderStatus(data.status)}`, {
          duration: 6000,
          icon: '🔔',
        });
      }
      prevStatusRef.current = data.status;
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

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    if (!order || !ACTIVE_ORDER_STATUSES.includes(order.status as typeof ACTIVE_ORDER_STATUSES[number])) return;
    const interval = setInterval(() => fetchOrder(true), 20000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

  useEffect(() => {
    if (!id || lastNotification?.orderId !== Number(id)) return;
    setLastLiveUpdateAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    fetchOrder(true);
  }, [fetchOrder, id, lastNotification?.id, lastNotification?.orderId]);

  async function handleConfirmCancel() {
    if (!id) return;
    setIsCancelling(true);
    try {
      const updated = await cancelOrder(Number(id), cancelReason);
      setOrder(updated);
      setShowCancelModal(false);
      setCancelReason('');
      toast.success('Order cancelled.');
    } catch {
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleSubmitProof(file: File) {
    if (!id) return;
    setIsSubmittingProof(true);
    try {
      const updated = await submitPayment(Number(id), file);
      setOrder(updated);
      setProofSubmitted(true);
      setShowPaymentModal(false);
      toast.success('Payment proof submitted! Waiting for seller to verify.', { duration: 6000 });
    } catch {
      toast.error('Failed to submit proof. Please try again.');
    } finally {
      setIsSubmittingProof(false);
    }
  }

  async function handleReorder() {
    if (!order) return;
    const orderable = order.items.filter((i) => i.productId != null);
    if (orderable.length === 0) {
      toast.error('No items could be added — products may have been removed from the menu.');
      return;
    }
    setIsReordering(true);
    try {
      await Promise.all(orderable.map((i) => addToCart(i.productId!, i.quantity)));
      openOrderPanel();
      navigate(ROUTES.MENU);
      toast.success(`${orderable.length} item${orderable.length > 1 ? 's' : ''} added to your cart!`);
    } catch {
      toast.error('Failed to add some items. Please try again.');
    } finally {
      setIsReordering(false);
    }
  }

  function openPaymentModal(defaultMethod: string) {
    setModalTab(QR_MAP[defaultMethod] ? defaultMethod : 'GCash');
    setModalQrExpanded(false);
    setShowPaymentModal(true);
  }

  function openQrLightbox() {
    setShowPaymentModal(false);
    setModalQrExpanded(true);
  }

  // ── Loading / error states ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="cod__loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="cod__not-found">
        <p className="cod__not-found-text">Order not found.</p>
        <button className="cod__not-found-btn" onClick={() => navigate(ROUTES.ORDERS)}>
          Back to Orders
        </button>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────

  const isPickup = isPickupOrder(order);
  const paymentMethod = extractPaymentMethod(order);
  const isCashOnPickup = paymentMethod === 'Cash on Pickup';
  const hasQR = !!QR_MAP[paymentMethod];
  const itemsSubtotal = order.subtotalAmount ?? order.items.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = order.deliveryFee ?? (order.totalAmount - itemsSubtotal);
  const hasDeliveryFeeQuoted = deliveryFee > 0;
  const isCancelled = order.status === 'CANCELLED';
  const helperText = getOrderStatusHelperText(order.status);
  const isPaymentRequired = order.status === 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED';

  const canCancel = !isCancelled &&
    ['ORDER_PLACED', 'AWAITING_DELIVERY_QUOTE',
      'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
      'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION'].includes(order.status);

  const modalQrSrc = QR_MAP[modalTab];
  const modalAccountDetails = ACCOUNT_DETAILS[modalTab];

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="cod">

      {/* Back */}
      <button className="cod__back" onClick={() => navigate(ROUTES.ORDERS)}>
        <ArrowLeft size={15} /> Back to Orders
      </button>

      {/* ── Full-width header card ── */}
      <div className="cod__header-card">
        <div className="cod__header-left">
          <div className="cod__header-title-row">
            <h2 className="cod__order-number">Order #{order.orderId}</h2>
            <span className={`cod__type-badge ${isPickup ? 'cod__type-badge--pickup' : 'cod__type-badge--delivery'}`}>
              {isPickup ? 'PICKUP' : 'DELIVERY'}
            </span>
          </div>
          <p className="cod__date">{formatDate(order.orderDate)}</p>
        </div>
        <span title={getStatusFullText(order.status) || undefined} className="cod__status-chip-wrap">
          <OrderStatusBadge status={order.status} />
        </span>
      </div>

      {lastLiveUpdateAt && (
        <div className="cod__live-update" aria-live="polite">
          Updated just now at {lastLiveUpdateAt}
        </div>
      )}

      {/* Helper banner — full width */}
      {helperText && (
        <div className={`cod__helper ${getHelperBannerClass(order.status)}`}>
          <Clock size={14} className="cod__helper-icon" />
          {helperText}
        </div>
      )}

      {/* ── Two-column grid ── */}
      <div className="cod__grid">

        {/* LEFT COLUMN — Order Status tracker */}
        <div className="cod__col-left">
          <div className="cod__timeline-card">
            <h3 className="cod__card-title">Order Status</h3>
            <StatusTimeline
              currentStatus={order.status}
              isCancelled={isCancelled}
              flowType={isPickup ? 'pickup' : 'delivery'}
            />
          </div>
        </div>

        {/* RIGHT COLUMN — action panels + info + items */}
        <div className="cod__col-right">

          {/* ── Status-specific action panels ── */}

          {/* Waiting for delivery quote */}
          {order.status === 'AWAITING_DELIVERY_QUOTE' && (
            <div className="cod__card cod__card--warn">
              <div className="cod__spinner-card">
                <div className="spinner cod__card-spinner" />
                <div>
                  <div className="cod__spinner-text-title">Waiting for Delivery Quote</div>
                  <div className="cod__spinner-text-desc">
                    The seller is checking delivery rates for your location. This page will update automatically.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pickup: Cash on Pickup */}
          {isPickup && isCashOnPickup && order.status === 'ORDER_PLACED' && (
            <div className="cod__status-banner cod__status-banner--success">
              <Package size={22} className="cod__banner-icon" />
              <div>
                <div className="cod__banner-text cod__banner-text--success">Cash on Pickup</div>
                <div className="cod__banner-subtext cod__banner-subtext--success">
                  Please prepare <strong>{formatPrice(itemsSubtotal)}</strong> in exact cash. Pay when you arrive at the store.
                </div>
              </div>
            </div>
          )}

          {/* Pickup: Digital payment — not yet submitted */}
          {isPickup && !isCashOnPickup && order.status === 'ORDER_PLACED' && !proofSubmitted && (
            <div className="cod__card cod__card--payment">
              <h3 className="cod__card-title">Pay via {paymentMethod}</h3>
              <p className="cod__payment-desc">
                Total due: <strong className="cod__payment-amount">{formatPrice(itemsSubtotal)}</strong>
              </p>
              {hasQR && (
                <div className="cod__qr-wrap">
                  <img
                    src={QR_MAP[paymentMethod]}
                    alt={`${paymentMethod} QR`}
                    className="cod__qr-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <ProofUploadForm
                onSubmit={handleSubmitProof}
                isSubmitting={isSubmittingProof}
                submitLabel="Submit Payment Proof"
              />
            </div>
          )}

          {/* Pickup: Digital payment submitted */}
          {isPickup && !isCashOnPickup && order.status === 'ORDER_PLACED' && proofSubmitted && (
            <div className="cod__proof-submitted">
              <CheckCircle size={18} className="cod__proof-icon" />
              <div>
                <div className="cod__proof-title">Proof Submitted</div>
                <div className="cod__proof-desc">Waiting for the seller to verify your payment.</div>
              </div>
            </div>
          )}

          {/* Proof submitted — waiting for verification */}
          {order.status === 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION' && (
            <div className="cod__card cod__card--info">
              <div className="cod__proof-submitted">
                <CheckCircle size={18} className="cod__proof-icon" />
                <div>
                  <div className="cod__proof-title">Payment Proof Submitted</div>
                  <div className="cod__proof-desc">Waiting for the seller to verify your payment.</div>
                </div>
              </div>
              {order.proofImageUrl && (
                <div className="cod__proof-img-wrap">
                  <p className="cod__proof-img-label">Your submitted proof:</p>
                  <img
                    src={order.proofImageUrl}
                    alt="Your payment proof"
                    className="cod__proof-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Out for delivery */}
          {order.status === 'OUT_FOR_DELIVERY' && (
            <div className="cod__status-banner cod__status-banner--info">
              <Truck size={22} className="cod__banner-icon" />
              <div className="cod__banner-text cod__banner-text--info">
                Your order is on its way! The rider is heading to your location.
              </div>
            </div>
          )}

          {/* Ready for pickup */}
          {order.status === 'READY' && (
            <div className="cod__status-banner cod__status-banner--success">
              <Package size={22} className="cod__banner-icon" />
              <div>
                <div className="cod__banner-text cod__banner-text--success">Your order is ready for pickup!</div>
                <div className="cod__banner-subtext cod__banner-subtext--success">
                  Don Gil Garcia St., Capitol Site, Cebu City
                </div>
              </div>
            </div>
          )}

          {/* ── Pickup / Delivery Info ── */}
          <div className="cod__card">
            <h3 className="cod__card-title">{isPickup ? 'Pickup Information' : 'Delivery Information'}</h3>
            <div className="cod__info-list">
              <div className="cod__info-item">
                <MapPin size={15} className="cod__info-icon" />
                <div>
                  <div className="cod__info-label">{isPickup ? 'Location' : 'Address'}</div>
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>
              <div className="cod__info-item">
                <Phone size={15} className="cod__info-icon" />
                <div>
                  <div className="cod__info-label">Contact</div>
                  <span>{order.contactNumber}</span>
                </div>
              </div>
              {paymentMethod && (
                <div className="cod__info-item">
                  <CreditCard size={15} className="cod__info-icon" />
                  <div>
                    <div className="cod__info-label">Payment Method</div>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              )}
              {order.cancellationReason && (
                <div className="cod__info-item">
                  <FileText size={15} className="cod__cancel-icon" />
                  <div>
                    <div className="cod__cancel-reason-label">Cancellation Reason</div>
                    <span className="cod__cancel-reason-text">{order.cancellationReason}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Items ── */}
          <div className="cod__card">
            <h3 className="cod__card-title">Order Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="cod__item-row">
                <div className="cod__item-info">
                  <span className="cod__item-name">{item.productName}</span>
                  <span className="cod__item-meta">Qty {item.quantity} × {formatPrice(item.unitPrice)}</span>
                </div>
                <span className="cod__item-price">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <hr className="cod__divider" />
            <div className="cod__total-row">
              <span>Items subtotal</span>
              <span>{formatPrice(itemsSubtotal)}</span>
            </div>
            {!isPickup && hasDeliveryFeeQuoted && (
              <div className="cod__total-row">
                <span>Delivery fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            {!isPickup && !hasDeliveryFeeQuoted && (
              <div className="cod__total-row cod__total-row--italic">
                <span>Delivery fee</span>
                <span>To be quoted</span>
              </div>
            )}
            <div className="cod__grand-total">
              <span>Total</span>
              <span className="cod__grand-price">{formatPrice(order.totalAmount)}</span>
            </div>

            {/* Pay Now + Cancel side by side — only when payment is required */}
            {isPaymentRequired && (
              <div className="cod__items-actions">
                {proofSubmitted ? (
                  <div className="cod__proof-submitted">
                    <CheckCircle size={18} className="cod__proof-icon" />
                    <div>
                      <div className="cod__proof-title">Proof Submitted</div>
                      <div className="cod__proof-desc">Waiting for the seller to verify your payment.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="cod__pay-btn cod__pay-btn--inline"
                      onClick={() => openPaymentModal(paymentMethod)}
                    >
                      Pay Now — {formatPrice(order.totalAmount)}
                    </button>
                    {canCancel && (
                      <button className="cod__cancel-btn cod__cancel-btn--inline" onClick={() => setShowCancelModal(true)}>
                        Cancel Order
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Cancel Order (non-payment states) ── */}
          {canCancel && !isPaymentRequired && (
            <button className="cod__cancel-btn" onClick={() => setShowCancelModal(true)}>
              Cancel Order
            </button>
          )}

          {/* ── Reorder (completed orders only) ── */}
          {order.status === 'COMPLETED' && (
            <button
              className="cod__reorder-btn"
              onClick={handleReorder}
              disabled={isReordering}
            >
              {isReordering ? 'Adding to cart…' : 'Reorder'}
            </button>
          )}

        </div>{/* end col-right */}
      </div>{/* end grid */}

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="cod__modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="cod__modal cod__modal--payment" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="cod__pay-modal-header">
              <div>
                <h3 className="cod__modal-title">Complete Payment</h3>
                <p className="cod__pay-modal-order-ref">
                  Order #{order.orderId} · Total due: <strong className="cod__payment-amount">{formatPrice(order.totalAmount)}</strong>
                </p>
              </div>
              <button className="cod__pay-modal-close" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Method tabs */}
            <div className="cod__pay-modal-tabs">
              {DELIVERY_PAYMENT_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`cod__pay-modal-tab ${modalTab === tab ? 'cod__pay-modal-tab--active' : ''}`}
                  onClick={() => {
              if (tab !== modalTab) {
                toast('Switching payment method may require re-uploading your proof of payment.', {
                  icon: '⚠️', duration: 4000,
                });
              }
              setModalTab(tab);
              setModalQrExpanded(false);
            }}
                >
                  {tab === 'Bank Transfer' ? 'BPI' : tab}
                </button>
              ))}
            </div>

            {/* QR code */}
            {modalQrSrc && (
              <div className="cod__pay-modal-qr-wrap">
                <img
                  src={modalQrSrc}
                  alt={`${modalTab} QR`}
                  className="cod__pay-modal-qr"
                  onClick={openQrLightbox}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <p className="cod__pay-modal-qr-hint">Tap to enlarge for scanning</p>
              </div>
            )}

            {/* Account details */}
            {modalAccountDetails && (
              <div className="cod__pay-modal-details">
                {modalAccountDetails.map((row) => (
                  <div key={row.label} className="cod__pay-modal-detail-row">
                    <span className="cod__pay-modal-detail-key">{row.label}</span>
                    <span className="cod__pay-modal-detail-value">{row.value}</span>
                  </div>
                ))}
                <div className="cod__pay-modal-detail-row">
                  <span className="cod__pay-modal-detail-key">Reference</span>
                  <span className="cod__pay-modal-detail-value cod__pay-modal-detail-value--ref">
                    Order #{order.orderId}
                  </span>
                </div>
              </div>
            )}

            {/* Proof upload — hidden if already submitted */}
            <div className="cod__pay-modal-proof">
              {order.proofImageUrl ? (
                <div className="cod__proof-submitted">
                  <CheckCircle size={18} className="cod__proof-icon" />
                  <div>
                    <div className="cod__proof-title">Proof Already Submitted</div>
                    <div className="cod__proof-desc">Your payment is awaiting verification.</div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="cod__pay-modal-proof-label">Upload Proof of Payment</p>
                  <ProofUploadForm
                    onSubmit={handleSubmitProof}
                    isSubmitting={isSubmittingProof}
                    submitLabel="Submit Payment"
                  />
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── QR Lightbox (from modal) ── */}
      {modalQrExpanded && modalQrSrc && (
        <div className="cod__lightbox" onClick={() => setModalQrExpanded(false)}>
          <img src={modalQrSrc} alt={`${modalTab} QR`} className="cod__lightbox-img" />
          <p className="cod__lightbox-hint">Tap anywhere to close</p>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => { if (!isCancelling) { setShowCancelModal(false); setCancelReason(''); } }}
        onConfirm={handleConfirmCancel}
        title={`Cancel Order #${order.orderId}`}
        description="Are you sure you want to cancel this order? Please let us know why."
        confirmLabel="Confirm Cancel"
        cancelLabel="Go Back"
        isDanger
        isConfirming={isCancelling}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="cod__modal-textarea"
        />
      </ConfirmModal>

    </div>
  );
}
