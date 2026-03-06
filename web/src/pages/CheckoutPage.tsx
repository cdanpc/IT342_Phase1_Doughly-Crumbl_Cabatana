import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, FileText } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { placeOrder } from '../api/orderApi';
import { formatPrice } from '../utils/formatters';
import { ROUTES } from '../utils/routes';
import toast from 'react-hot-toast';
import '../components/common/LoadingSpinner.css';

const DELIVERY_FEE = 80;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const total = subtotal + DELIVERY_FEE;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    if (!address.trim() || !phone.trim()) {
      toast.error('Please fill in delivery address and phone number.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        deliveryAddress: address.trim(),
        contactNumber: phone.trim(),
        deliveryNotes: notes.trim() || undefined,
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
        Review your order and enter delivery details
      </p>

      <form onSubmit={handlePlaceOrder}>
        {/* Delivery Details */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 20 }}>
            Delivery Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <MapPin size={14} /> Delivery Address
              </label>
              <input
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 15, background: '#FAFAFA', outline: 'none',
                }}
                type="text"
                placeholder="123 Bakery Street, Cebu City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

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
            <span>{formatPrice(DELIVERY_FEE)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
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
