import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, FileText } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { placeOrder } from '../api/orderApi';
import { formatPrice } from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';

type FulfillmentMethod = 'PICKUP' | 'DELIVERY';
type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  GCASH: 'GCash',
  MAYA: 'Maya',
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_PICKUP: 'Cash on Pickup',
};

export default function CheckoutPage() {
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

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const isDelivery = fulfillmentMethod === 'DELIVERY';
  const availablePaymentMethods: PaymentMethod[] = isDelivery
    ? ['GCASH', 'MAYA', 'BANK_TRANSFER']
    : ['GCASH', 'MAYA', 'BANK_TRANSFER', 'CASH_ON_PICKUP'];

  function handleFulfillmentChange(nextMethod: FulfillmentMethod) {
    setFulfillmentMethod(nextMethod);
    if (nextMethod === 'DELIVERY' && paymentMethod === 'CASH_ON_PICKUP') {
      setPaymentMethod('GCASH');
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    if (!phone.trim()) {
      toast.error('Please fill in your contact number.');
      return;
    }

    if (isDelivery && (!street.trim() || !barangay.trim() || !city.trim())) {
      toast.error('Please complete your delivery address (street, barangay, city).');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

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
      toast.success('Order placed successfully!');
      navigate(ROUTES.ORDER_SUCCESS, { state: { order } });
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 720, animation: 'fadeIn 0.3s ease-out' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
        Checkout
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Review your order, choose fulfillment, and submit your request.
      </p>

      <form onSubmit={handlePlaceOrder}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 14 }}>
            Fulfillment Method
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleFulfillmentChange('PICKUP')}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${fulfillmentMethod === 'PICKUP' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: fulfillmentMethod === 'PICKUP' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                background: fulfillmentMethod === 'PICKUP' ? 'var(--color-primary-light)' : '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Pickup
            </button>
            <button
              type="button"
              onClick={() => handleFulfillmentChange('DELIVERY')}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${fulfillmentMethod === 'DELIVERY' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: fulfillmentMethod === 'DELIVERY' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                background: fulfillmentMethod === 'DELIVERY' ? 'var(--color-primary-light)' : '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Delivery Details */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 20 }}>
            {isDelivery ? 'Delivery Details' : 'Pickup Details'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {isDelivery && (
              <>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    <MapPin size={14} /> Street Address
                  </label>
                  <input
                    style={{
                      width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                    }}
                    type="text"
                    placeholder="House/Unit, Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required={isDelivery}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Barangay</label>
                    <input
                      style={{
                        width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                      }}
                      type="text"
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      required={isDelivery}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>City</label>
                    <input
                      style={{
                        width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                      }}
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required={isDelivery}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Landmark (Optional)</label>
                  <input
                    style={{
                      width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                    }}
                    type="text"
                    placeholder="Near school/church/building"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Delivery fee is calculated based on your location and confirmed before payment.
                </p>
              </>
            )}

            {!isDelivery && (
              <div
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontSize: 14,
                }}
              >
                Pickup location: Don Gil Garcia St., Capitol Site, Cebu City
              </div>
            )}

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <Phone size={14} /> Contact Number
              </label>
              <input
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                }}
                type="tel"
                placeholder="09171234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Payment Method
              </label>
              <select
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {availablePaymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_LABELS[method]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <FileText size={14} /> Delivery Notes (Optional)
              </label>
              <textarea
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                  resize: 'vertical', minHeight: 80, fontFamily: 'inherit',
                }}
                placeholder="Leave at the door, ring the bell..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 20 }}>
            Order Summary
          </h3>

          {items.map((item) => (
            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span>{item.productName} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(item.subtotal)}</span>
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            <span>Delivery fee</span>
            <span>{isDelivery ? 'To be quoted' : 'N/A (Pickup)'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          style={{
            width: '100%', padding: 14, background: 'var(--color-primary)', color: '#fff',
            fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {isSubmitting ? <span className="spinner-small" /> : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
