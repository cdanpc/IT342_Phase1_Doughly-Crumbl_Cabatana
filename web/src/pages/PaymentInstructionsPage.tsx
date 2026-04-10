import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Upload } from 'lucide-react';
import { getOrderById } from '../api/orderApi';
import { formatPrice } from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';

type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  GCASH: 'GCash',
  MAYA: 'Maya',
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_PICKUP: 'Cash on Pickup',
};

function getDefaultPaymentMethod(order: Order | null): PaymentMethod {
  if (!order?.deliveryNotes) return 'GCASH';
  const notes = order.deliveryNotes.toLowerCase();
  if (notes.includes('maya')) return 'MAYA';
  if (notes.includes('bank')) return 'BANK_TRANSFER';
  if (notes.includes('cash on pickup')) return 'CASH_ON_PICKUP';
  return 'GCASH';
}

function getPaymentInstruction(method: PaymentMethod): string {
  if (method === 'GCASH') {
    return 'Scan the GCash QR code or send payment to 09165667589. Use your Order ID as reference.';
  }
  if (method === 'MAYA') {
    return 'Scan the Maya QR code or send payment to @doughlycrumbl. Use your Order ID as reference.';
  }
  if (method === 'BANK_TRANSFER') {
    return 'Transfer to BDO 0123456789 (Doughly Crumbl). Include your Order ID in transfer notes.';
  }
  return 'Cash payment is accepted only for pickup orders. Please prepare exact amount at pickup.';
}

export default function PaymentInstructionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCASH');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) {
        setIsLoading(false);
        return;
      }
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

  const isPickup = useMemo(() => {
    return order?.deliveryAddress.toLowerCase().includes('pickup') ?? false;
  }, [order]);

  const availableMethods: PaymentMethod[] = isPickup
    ? ['GCASH', 'MAYA', 'BANK_TRANSFER', 'CASH_ON_PICKUP']
    : ['GCASH', 'MAYA', 'BANK_TRANSFER'];

  async function handleSubmitPayment() {
    if (!order) return;

    if (paymentMethod !== 'CASH_ON_PICKUP' && !proofFile) {
      toast.error('Please upload proof of payment first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = localStorage.getItem('paymentProofSubmissions');
      const parsed = existing ? JSON.parse(existing) : {};
      parsed[order.orderId] = {
        orderId: order.orderId,
        paymentMethod,
        proofFileName: proofFile?.name ?? null,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem('paymentProofSubmissions', JSON.stringify(parsed));

      toast.success('Payment submitted. Awaiting confirmation.');
      navigate(ROUTES.ORDERS);
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
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>Order not found.</p>
        <button
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            fontWeight: 600,
          }}
          onClick={() => navigate(ROUTES.ORDERS)}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 760, animation: 'fadeIn 0.3s ease-out' }}>
      <button
        onClick={() => navigate(`/orders/${order.orderId}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--color-text-secondary)',
          marginBottom: 24,
          background: 'none',
          border: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to Order Details
      </button>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Payment Instructions</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Order #{order.orderId} • Total currently shown: {formatPrice(order.totalAmount)}
      </p>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Select Payment Method</h3>
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          style={{
            width: '100%',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: 16,
            background: '#FAFAFA',
          }}
        >
          {availableMethods.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_LABELS[method]}
            </option>
          ))}
        </select>

        <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 8 }}>
            <CreditCard size={16} /> {PAYMENT_LABELS[paymentMethod]} Instructions
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{getPaymentInstruction(paymentMethod)}</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Proof of Payment Upload</h3>

        {paymentMethod === 'CASH_ON_PICKUP' ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Proof upload is not required for cash on pickup.
          </p>
        ) : (
          <>
            <label
              htmlFor="payment-proof"
              style={{
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              <Upload size={16} />
              <span>{proofFile ? proofFile.name : 'Choose image file (JPG/PNG)'}</span>
            </label>
            <input
              id="payment-proof"
              type="file"
              accept="image/*"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </>
        )}

        <button
          onClick={handleSubmitPayment}
          disabled={isSubmitting || (paymentMethod !== 'CASH_ON_PICKUP' && !proofFile)}
          style={{
            marginTop: 10,
            width: '100%',
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontWeight: 700,
            opacity: isSubmitting || (paymentMethod !== 'CASH_ON_PICKUP' && !proofFile) ? 0.6 : 1,
            cursor:
              isSubmitting || (paymentMethod !== 'CASH_ON_PICKUP' && !proofFile)
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Payment'}
        </button>
      </div>
    </div>
  );
}
