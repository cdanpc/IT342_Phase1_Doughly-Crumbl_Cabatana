import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, FileText, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../shared/hooks/CartContext';
import { placeOrder } from '../../shared/api/orderApi';
import { formatPrice } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';

type FulfillmentMethod = 'PICKUP' | 'DELIVERY';
type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  GCASH: 'GCash',
  MAYA: 'Maya',
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_PICKUP: 'Cash on Pickup',
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('DELIVERY');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; street?: string; barangay?: string; city?: string }>({});

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const isDelivery = fulfillmentMethod === 'DELIVERY';
  const availablePaymentMethods: PaymentMethod[] = isDelivery
    ? ['GCASH', 'MAYA', 'BANK_TRANSFER']
    : ['GCASH', 'MAYA', 'BANK_TRANSFER', 'CASH_ON_PICKUP'];

  function handleFulfillmentChange(nextMethod: FulfillmentMethod) {
    setFulfillmentMethod(nextMethod);
    if (nextMethod === 'PICKUP') {
      setPaymentMethod('CASH_ON_PICKUP');
    } else {
      if (paymentMethod === 'CASH_ON_PICKUP') {
        setPaymentMethod('GCASH');
      }
    }
  }

  function handlePlaceOrder() {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const errs: typeof fieldErrors = {};
    if (!phone.trim()) {
      errs.phone = 'Contact number is required.';
    } else if (!/^(09\d{9}|\+639\d{9})$/.test(phone.trim())) {
      errs.phone = 'Enter a valid PH number (e.g. 09171234567).';
    }
    if (isDelivery) {
      if (!street.trim()) errs.street = 'Street address is required.';
      if (!barangay.trim()) errs.barangay = 'Barangay is required.';
      if (!city.trim()) errs.city = 'City is required.';
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setIsConfirmOpen(true);
  }

  function resetForm() {
    setFulfillmentMethod('DELIVERY');
    setStreet('');
    setBarangay('');
    setCity('');
    setLandmark('');
    setPhone('');
    setPaymentMethod('GCASH');
    setNotes('');
    setFieldErrors({});
  }

  async function confirmPlaceOrder() {
    setIsSubmitting(true);
    try {
      const deliveryAddress = isDelivery
        ? `${street.trim()}, ${barangay.trim()}, ${city.trim()}${landmark.trim() ? ` (Landmark: ${landmark.trim()})` : ''}`
        : 'Pickup - Don Gil Garcia St., Capitol Site, Cebu City';

      const orderNotes = [
        `Fulfillment: ${fulfillmentMethod}`,
        `Payment Method: ${PAYMENT_LABELS[paymentMethod]}`,
        notes.trim(),
      ]
        .filter(Boolean)
        .join(' | ');

      const order = await placeOrder({
        deliveryAddress,
        contactNumber: phone.trim(),
        deliveryNotes: orderNotes || undefined,
      });
      await clearCart();
      setIsConfirmOpen(false);
      resetForm();
      onClose();
      toast.success('Order placed! Awaiting delivery quote.');
      navigate(ROUTES.ORDER_SUCCESS, { state: { order, fulfillmentMethod } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to place order. Please check your connection and try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
    background: '#FAFAFA',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const sectionStyle: React.CSSProperties = {
    background: '#F7F7F7',
    borderRadius: 'var(--radius-md)',
    padding: '18px 20px',
    marginBottom: 14,
    border: '1px solid var(--color-border)',
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 14,
    margin: '0 0 14px 0',
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={() => !isSubmitting && onClose()}
      >
        {/* Modal panel */}
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
              background: '#fff',
              flexShrink: 0,
            }}
          >
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: 0 }}>
                Place Order
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '2px 0 0 0' }}>
                {isDelivery
                  ? 'Delivery fee will be confirmed by the seller before payment.'
                  : 'No delivery fee — pay at pickup or via your chosen payment method.'}
              </p>
            </div>
            <button
              onClick={() => !isSubmitting && onClose()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 6,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', padding: '18px 24px', flex: 1, background: '#ffffff' }}>
            <form onSubmit={(e) => e.preventDefault()}>

              {/* 1. Order Summary */}
              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={15} /> Order Summary
                  </span>
                </h3>

                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 0',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {item.productName}{' '}
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                        × {item.quantity}
                      </span>
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  <span>Delivery fee</span>
                  <span style={{ fontStyle: 'italic' }}>{isDelivery ? 'To be quoted' : 'N/A (Pickup)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
                  <span>Subtotal Due</span>
                  <span style={{ color: 'var(--color-primary)' }}>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* 2. Fulfillment Toggle */}
              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Fulfillment Method</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['PICKUP', 'DELIVERY'] as FulfillmentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleFulfillmentChange(method)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--radius-full)',
                        border: `1.5px solid ${fulfillmentMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: fulfillmentMethod === method ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        background: fulfillmentMethod === method ? 'var(--color-primary-light)' : '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {method === 'PICKUP' ? 'Pickup' : 'Delivery'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Delivery / Pickup Details */}
              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>
                  {isDelivery ? 'Delivery Details' : 'Pickup Details'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {isDelivery ? (
                    <>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                          <MapPin size={13} /> Street Address <span style={{ color: 'var(--color-primary)' }}>*</span>
                        </label>
                        <input
                          style={{ ...inputStyle, ...(fieldErrors.street ? { borderColor: 'var(--color-error)' } : {}) }}
                          type="text"
                          placeholder="House/Unit No., Street Name"
                          value={street}
                          onChange={(e) => { setStreet(e.target.value); setFieldErrors((p) => ({ ...p, street: undefined })); }}
                        />
                        {fieldErrors.street && <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{fieldErrors.street}</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            Barangay <span style={{ color: 'var(--color-primary)' }}>*</span>
                          </label>
                          <input
                            style={{ ...inputStyle, ...(fieldErrors.barangay ? { borderColor: 'var(--color-error)' } : {}) }}
                            type="text"
                            value={barangay}
                            onChange={(e) => { setBarangay(e.target.value); setFieldErrors((p) => ({ ...p, barangay: undefined })); }}
                          />
                          {fieldErrors.barangay && <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{fieldErrors.barangay}</span>}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            City <span style={{ color: 'var(--color-primary)' }}>*</span>
                          </label>
                          <input
                            style={{ ...inputStyle, ...(fieldErrors.city ? { borderColor: 'var(--color-error)' } : {}) }}
                            type="text"
                            value={city}
                            onChange={(e) => { setCity(e.target.value); setFieldErrors((p) => ({ ...p, city: undefined })); }}
                          />
                          {fieldErrors.city && <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{fieldErrors.city}</span>}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                          Landmark <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(Optional — helps the rider find you)</span>
                        </label>
                        <input
                          style={inputStyle}
                          type="text"
                          placeholder="Near school, church, building..."
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </div>

                      {/* Delivery fee notice */}
                      <div
                        style={{
                          background: '#FFF8E7',
                          border: '1px solid #F5C842',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 14px',
                          fontSize: 13,
                          color: '#7a5c00',
                          lineHeight: 1.5,
                        }}
                      >
                        Delivery fee will be quoted by the seller based on your location and reflected in your total before payment.
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        background: 'var(--color-primary-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        fontSize: 14,
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                      }}
                    >
                      Pickup at: Don Gil Garcia St., Capitol Site, Cebu City
                    </div>
                  )}

                  {/* Contact Number */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      <Phone size={13} /> Contact Number <span style={{ color: 'var(--color-primary)' }}>*</span>
                    </label>
                    <input
                      style={{ ...inputStyle, ...(fieldErrors.phone ? { borderColor: 'var(--color-error)' } : {}) }}
                      type="tel"
                      placeholder="09171234567"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: undefined })); }}
                    />
                    {fieldErrors.phone && <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{fieldErrors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* 4. Payment Method */}
              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Payment Method</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                  {isDelivery
                    ? 'QR code and exact amount will be provided after the seller confirms the delivery fee.'
                    : paymentMethod === 'CASH_ON_PICKUP'
                    ? 'Pay in cash when you arrive at the store. No online payment needed.'
                    : 'QR code will be shown in your order detail after placing.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        border: `1.5px solid ${paymentMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: paymentMethod === method ? 'var(--color-primary-light)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: 14, fontWeight: paymentMethod === method ? 600 : 400 }}>
                        {PAYMENT_LABELS[method]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Order Notes (optional) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <FileText size={13} /> Order Notes <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: 70,
                    fontFamily: 'inherit',
                  }}
                  placeholder="Any special instructions for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Place Order button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
                style={{
                  width: '100%',
                  padding: 14,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isSubmitting || items.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || items.length === 0 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 4,
                  transition: 'opacity 0.2s',
                }}
              >
                {isSubmitting ? <span className="spinner-small" /> : 'Place Order'}
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* Confirm sub-modal */}
      {isConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => !isSubmitting && setIsConfirmOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
              Confirm Order
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              Your order will be submitted. The seller will quote the delivery fee and notify you before payment is collected.
            </p>

            <div style={{ background: '#F7F7F7', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fulfillment</span>
                <strong>{fulfillmentMethod === 'DELIVERY' ? 'Delivery' : 'Pickup'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Payment via</span>
                <strong>{PAYMENT_LABELS[paymentMethod]}</strong>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <span>Delivery fee</span>
                <span style={{ fontStyle: 'italic' }}>{isDelivery ? 'To be quoted' : 'N/A'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: '#fff',
                  fontSize: 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmPlaceOrder}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  minWidth: 120,
                }}
              >
                {isSubmitting ? 'Placing...' : 'Confirm & Place'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
