import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote } from 'lucide-react';
import { getOrderById, submitPayment } from '../api/orderApi';
import { formatPrice } from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';
import ProofUploadForm from '../components/ProofUploadForm';
import './PaymentInstructionsPage.css';

type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  GCASH: 'GCash',
  MAYA: 'Maya',
  BANK_TRANSFER: 'Bank Transfer (BPI)',
  CASH_ON_PICKUP: 'Cash on Pickup',
};

const PAYMENT_TAB_LABELS: Record<PaymentMethod, string> = {
  GCASH: 'GCash',
  MAYA: 'Maya',
  BANK_TRANSFER: 'BPI',
  CASH_ON_PICKUP: 'Cash',
};

const QR_MAP: Record<string, string> = {
  GCASH: '/gcash-qr.jpg',
  MAYA: '/maya-qr.jpg',
  BANK_TRANSFER: '/bpi-qr.jpg',
};

const ACCOUNT_DETAILS: Record<string, { label: string; value: string }[]> = {
  GCASH: [
    { label: 'Name', value: 'Doughly Crumbl' },
    { label: 'Number', value: '0916 566 7589' },
  ],
  MAYA: [
    { label: 'Name', value: 'Chris Daniel Cabataña' },
    { label: 'Username', value: '@cdanpc' },
    { label: 'Number', value: '+63 *** *** 8113' },
  ],
  BANK_TRANSFER: [
    { label: 'Bank', value: 'BPI' },
    { label: 'Name', value: 'Briana' },
    { label: 'Account', value: 'xxxxxxxxxx521' },
  ],
};

function getDefaultPaymentMethod(order: Order | null): PaymentMethod {
  if (!order?.deliveryNotes) return 'GCASH';
  const notes = order.deliveryNotes.toLowerCase();
  if (notes.includes('maya')) return 'MAYA';
  if (notes.includes('bank')) return 'BANK_TRANSFER';
  if (notes.includes('cash on pickup')) return 'CASH_ON_PICKUP';
  return 'GCASH';
}

export default function PaymentInstructionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) { setIsLoading(false); return; }
      try {
        const data = await getOrderById(Number(id));
        setOrder(data);
        setPaymentMethod(getDefaultPaymentMethod(data));
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const isPickup = useMemo(
    () => order?.deliveryAddress.toLowerCase().includes('pickup') ?? false,
    [order]
  );

  const availableMethods: PaymentMethod[] = isPickup
    ? ['GCASH', 'MAYA', 'BANK_TRANSFER', 'CASH_ON_PICKUP']
    : ['GCASH', 'MAYA', 'BANK_TRANSFER'];

  const ONLINE_METHODS: PaymentMethod[] = ['GCASH', 'MAYA', 'BANK_TRANSFER'];

  function handleTabChange(newMethod: PaymentMethod) {
    if (ONLINE_METHODS.includes(paymentMethod) && newMethod !== paymentMethod) {
      toast('Switching payment method may require re-uploading your proof of payment.', {
        icon: '⚠️',
        duration: 4000,
      });
    }
    setPaymentMethod(newMethod);
  }

  async function handleSubmitCashOnPickup() {
    if (!order) return;
    setIsSubmitting(true);
    try {
      await submitPayment(order.orderId);
      toast.success('Payment submitted. Awaiting confirmation.');
      navigate(ROUTES.ORDERS);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to submit payment. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitWithProof(file: File) {
    if (!order) return;
    setIsSubmitting(true);
    try {
      await submitPayment(order.orderId, file);
      toast.success('Payment submitted. Awaiting confirmation.');
      navigate(ROUTES.ORDERS);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to submit payment. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <p style={{ marginBottom: 16 }}>Order not found.</p>
        <button
          style={{
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)', padding: '10px 20px',
            fontWeight: 600, border: 'none', cursor: 'pointer',
          }}
          onClick={() => navigate(ROUTES.ORDERS)}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((s, i) => s + i.subtotal, 0);
  const isCash = paymentMethod === 'CASH_ON_PICKUP';
  const qrSrc = QR_MAP[paymentMethod];
  const accountDetails = ACCOUNT_DETAILS[paymentMethod];

  return (
    <div className="pip">

      <button className="pip__back" onClick={() => navigate(`/orders/${order.orderId}`)}>
        <ArrowLeft size={15} /> Back to Order Details
      </button>

      <h2 className="pip__title">Complete Payment</h2>
      <p className="pip__subtitle">
        Order #{order.orderId} &nbsp;·&nbsp; Total due:{' '}
        <strong>{formatPrice(order.totalAmount)}</strong>
      </p>

      {/* ── Method tabs ── */}
      <div className="pip__tabs">
        {availableMethods.map((m) => (
          <button
            key={m}
            className={`pip__tab ${paymentMethod === m ? 'pip__tab--active' : ''}`}
            onClick={() => { handleTabChange(m); setQrExpanded(false); }}
          >
            {PAYMENT_TAB_LABELS[m]}
          </button>
        ))}
      </div>

      {/* ── Payment details card ── */}
      <div className="pip__card">

        {/* Total banner */}
        <div className="pip__total-banner">
          <span className="pip__total-label">
            {isCash ? 'Prepare exact cash' : `Pay via ${PAYMENT_LABELS[paymentMethod]}`}
          </span>
          <span className="pip__total-amount">
            {formatPrice(isCash ? itemsSubtotal : order.totalAmount)}
          </span>
        </div>

        {/* QR code + account details */}
        {!isCash && qrSrc && (
          <div className="pip__qr-section">
            <img
              src={qrSrc}
              alt={`${PAYMENT_LABELS[paymentMethod]} QR`}
              className="pip__qr-img pip__qr-img--clickable"
              onClick={() => setQrExpanded(true)}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p className="pip__qr-hint">Tap to enlarge for scanning</p>
            {accountDetails && (
              <div className="pip__account-details">
                {accountDetails.map((row) => (
                  <div key={row.label} className="pip__account-row">
                    <span className="pip__account-key">{row.label}</span>
                    <span className="pip__account-value">{row.value}</span>
                  </div>
                ))}
                <div className="pip__account-row">
                  <span className="pip__account-key">Reference</span>
                  <span className="pip__account-value pip__account-value--ref">
                    Order #{order.orderId}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cash on pickup */}
        {isCash && (
          <>
            <div className="pip__cash-icon-wrap">
              <Banknote size={48} color="var(--color-primary)" />
            </div>
            <p className="pip__cash-title">Pay at the Store</p>
            <p className="pip__cash-desc">
              Please prepare the exact amount in cash.
              Payment is collected when you arrive to pick up your order.
            </p>
          </>
        )}
      </div>

      {/* ── Proof upload card ── */}
      <div className="pip__card">
        {isCash ? (
          <>
            <p className="pip__upload-title">No Proof Required</p>
            <p className="pip__upload-desc">Cash payment is confirmed in-store at pickup.</p>
            <button
              className="pip__submit-btn"
              onClick={handleSubmitCashOnPickup}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Order'}
            </button>
          </>
        ) : (
          <>
            <p className="pip__upload-title">Upload Proof of Payment</p>
            <p className="pip__upload-desc">
              Take a screenshot of your payment confirmation and upload it below.
            </p>
            <ProofUploadForm
              onSubmit={handleSubmitWithProof}
              isSubmitting={isSubmitting}
              submitLabel="Submit Payment"
            />
          </>
        )}
      </div>

      {/* ── QR Lightbox ── */}
      {qrExpanded && qrSrc && (
        <div className="pip__lightbox" onClick={() => setQrExpanded(false)}>
          <img
            src={qrSrc}
            alt={`${PAYMENT_LABELS[paymentMethod]} QR`}
            className="pip__lightbox-img"
          />
          <p className="pip__lightbox-hint">Tap anywhere to close</p>
        </div>
      )}

    </div>
  );
}
