import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, FileText, Clock, CheckCircle, Package, Truck, CreditCard, X } from 'lucide-react';
import { getOrderById, submitPayment, cancelOrder } from '../../shared/api/orderApi';
import {
  formatPrice,
  formatDate,
  getStatusColor,
  formatOrderStatus,
  getOrderStatusHelperText,
} from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import type { Order } from '../../shared/types';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';
import ProofUploadForm from '../../shared/components/ProofUploadForm';
import StatusTimeline from '../../shared/components/StatusTimeline';
import './OrderDetailPage.css';

function isPickupOrder(order: Order): boolean {
  return order.deliveryAddress?.startsWith('Pickup');
}

function extractPaymentMethod(notes: string): string {
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

const ACTIVE_STATUSES = [
  'ORDER_PLACED',
  'AWAITING_DELIVERY_QUOTE',
  'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED',
  'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION',
  'PREPARING',
  'OUT_FOR_DELIVERY',
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return;
    const interval = setInterval(() => fetchOrder(true), 20000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

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

  function openPaymentModal(defaultMethod: string) {
    setModalTab(QR_MAP[defaultMethod] ? defaultMethod : 'GCash');
    setModalQrExpanded(false);
    setShowPaymentModal(true);
  }

  // ── Loading / error states ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 16, marginBottom: 24 }}>Order not found.</p>
        <button
          onClick={() => navigate(ROUTES.ORDERS)}
          style={{
            padding: '10px 24px', background: 'var(--color-primary)', color: '#fff',
            fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────

  const isPickup = isPickupOrder(order);
  const paymentMethod = extractPaymentMethod(order.deliveryNotes);
  const isCashOnPickup = paymentMethod === 'Cash on Pickup';
  const hasQR = !!QR_MAP[paymentMethod];
  const itemsSubtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = order.totalAmount - itemsSubtotal;
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
        <span
          className="cod__status-chip"
          style={{
            background: getStatusColor(order.status) + '20',
            color: getStatusColor(order.status),
          }}
        >
          {formatOrderStatus(order.status)}
        </span>
      </div>

      {/* Helper banner — full width */}
      {helperText && (
        <div
          className="cod__helper"
          style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}
        >
          <Clock
            size={14}
            className="cod__helper-icon"
            style={{ color: getStatusColor(order.status) }}
          />
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
                <div className="spinner" style={{ width: 26, height: 26, flexShrink: 0 }} />
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
              <Package size={22} color="#15803D" className="cod__banner-icon" />
              <div>
                <div className="cod__banner-text" style={{ color: '#15803D' }}>Cash on Pickup</div>
                <div className="cod__banner-subtext" style={{ color: '#166534' }}>
                  Please prepare <strong>{formatPrice(itemsSubtotal)}</strong> in exact cash. Pay when you arrive at the store.
                </div>
              </div>
            </div>
          )}

          {/* Pickup: Digital payment — not yet submitted */}
          {isPickup && !isCashOnPickup && order.status === 'ORDER_PLACED' && !proofSubmitted && (
            <div className="cod__card cod__card--payment">
              <h3 className="cod__card-title">Pay via {paymentMethod}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                Total due: <strong style={{ color: 'var(--color-primary)' }}>{formatPrice(itemsSubtotal)}</strong>
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
              <ProofUploadForm onSubmit={handleSubmitProof} />
            </div>
          )}

          {/* Pickup: Digital payment submitted */}
          {isPickup && !isCashOnPickup && order.status === 'ORDER_PLACED' && proofSubmitted && (
            <div className="cod__proof-submitted">
              <CheckCircle size={18} color="#16a34a" />
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
                <CheckCircle size={18} color="#16a34a" />
                <div>
                  <div className="cod__proof-title">Payment Proof Submitted</div>
                  <div className="cod__proof-desc">Waiting for the seller to verify your payment.</div>
                </div>
              </div>
              {order.proofImageUrl && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Your submitted proof:
                  </p>
                  <img
                    src={order.proofImageUrl}
                    alt="Your payment proof"
                    style={{
                      width: '100%', maxHeight: 220, objectFit: 'contain',
                      borderRadius: 8, border: '1px solid #86EFAC', display: 'block',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Out for delivery */}
          {order.status === 'OUT_FOR_DELIVERY' && (
            <div className="cod__status-banner cod__status-banner--info">
              <Truck size={22} color="#2563EB" className="cod__banner-icon" />
              <div className="cod__banner-text" style={{ color: '#1D4ED8' }}>
                Your order is on its way! The rider is heading to your location.
              </div>
            </div>
          )}

          {/* Ready for pickup */}
          {order.status === 'READY' && (
            <div className="cod__status-banner cod__status-banner--success">
              <Package size={22} color="#15803D" className="cod__banner-icon" />
              <div>
                <div className="cod__banner-text" style={{ color: '#15803D' }}>Your order is ready for pickup!</div>
                <div className="cod__banner-subtext" style={{ color: '#166534' }}>
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
                  <FileText size={15} style={{ flexShrink: 0, marginTop: 2, color: '#DC2626' }} />
                  <div>
                    <div className="cod__cancel-reason-label">Cancellation Reason</div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                      {order.cancellationReason}
                    </span>
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
                    <CheckCircle size={18} color="#16a34a" />
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

        </div>{/* end col-right */}
      </div>{/* end grid */}

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="cod__modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="cod__modal cod__modal--payment" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="cod__pay-modal-header">
              <div>
                <h3 className="cod__modal-title" style={{ marginBottom: 2 }}>Complete Payment</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                  Order #{order.orderId} · Total due: <strong style={{ color: 'var(--color-primary)' }}>{formatPrice(order.totalAmount)}</strong>
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
                  onClick={() => setModalQrExpanded(true)}
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
                  <CheckCircle size={18} color="#16a34a" />
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
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 12 }}>Tap anywhere to close</p>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {showCancelModal && (
        <div className="cod__modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cod__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="cod__modal-title">Cancel Order</h3>
            <p className="cod__modal-desc">
              Are you sure you want to cancel Order #{order.orderId}? Please let us know why.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="cod__modal-textarea"
            />
            <div className="cod__modal-btns">
              <button
                className="cod__modal-btn cod__modal-btn--back"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>
              <button
                className={`cod__modal-btn ${isCancelling ? 'cod__modal-btn--cancelling' : 'cod__modal-btn--cancel'}`}
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
