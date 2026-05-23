import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../shared/hooks/CartContext';
import { placeOrder } from '../../shared/api/orderApi';
import { formatPrice } from '../../shared/utils/formatters';
import { ROUTES } from '../../shared/utils/routes';
import '../../shared/components/LoadingSpinner.css';
import './CheckoutModal.css';

type FulfillmentMethod = 'PICKUP' | 'DELIVERY';
type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP';
type CheckoutStep = 'details' | 'review';

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

interface FieldErrors {
  phone?: string;
  street?: string;
  barangay?: string;
  city?: string;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>('details');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('DELIVERY');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const items = cart?.items ?? [];
  const subtotal = cart?.totalAmount ?? 0;
  const isDelivery = fulfillmentMethod === 'DELIVERY';
  const availablePaymentMethods: PaymentMethod[] = isDelivery
    ? ['GCASH', 'MAYA', 'BANK_TRANSFER']
    : ['GCASH', 'MAYA', 'BANK_TRANSFER', 'CASH_ON_PICKUP'];
  const deliveryAddressPreview = isDelivery
    ? [street.trim(), barangay.trim(), city.trim()].filter(Boolean).join(', ')
    : 'Pickup - Don Gil Garcia St., Capitol Site, Cebu City';

  function handleFulfillmentChange(nextMethod: FulfillmentMethod) {
    setFulfillmentMethod(nextMethod);
    setSubmitError('');
    if (nextMethod === 'PICKUP') {
      setPaymentMethod('CASH_ON_PICKUP');
    } else if (paymentMethod === 'CASH_ON_PICKUP') {
      setPaymentMethod('GCASH');
    }
  }

  function validateDetails(): boolean {
    const errs: FieldErrors = {};
    if (!phone.trim()) {
      errs.phone = 'Contact number is required.';
    } else if (!/^(09\d{9}|\+639\d{9})$/.test(phone.trim())) {
      errs.phone = 'Enter a valid PH number, such as 09171234567.';
    }
    if (isDelivery) {
      if (!street.trim()) errs.street = 'Street address is required.';
      if (!barangay.trim()) errs.barangay = 'Barangay is required.';
      if (!city.trim()) errs.city = 'City is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleReviewOrder() {
    setSubmitError('');
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!validateDetails()) return;
    setStep('review');
  }

  const resetForm = useCallback(() => {
    setStep('details');
    setFulfillmentMethod('DELIVERY');
    setStreet('');
    setBarangay('');
    setCity('');
    setLandmark('');
    setPhone('');
    setPaymentMethod('GCASH');
    setNotes('');
    setSubmitError('');
    setFieldErrors({});
  }, []);

  const closeCheckout = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, onClose, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape' || isSubmitting) return;
      if (step === 'review') setStep('details');
      else closeCheckout();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeCheckout, isOpen, isSubmitting, step]);

  async function confirmPlaceOrder() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const deliveryAddress = isDelivery
        ? `${street.trim()}, ${barangay.trim()}, ${city.trim()}${landmark.trim() ? ` (Landmark: ${landmark.trim()})` : ''}`
        : 'Pickup - Don Gil Garcia St., Capitol Site, Cebu City';

      const order = await placeOrder({
        deliveryAddress,
        contactNumber: phone.trim(),
        fulfillmentMethod,
        paymentMethod,
        deliveryNotes: notes.trim() || undefined,
      });
      await clearCart();
      resetForm();
      onClose();
      toast.success(isDelivery ? 'Order placed! Awaiting delivery quote.' : 'Order placed for pickup.');
      navigate(ROUTES.ORDER_SUCCESS, { state: { order, fulfillmentMethod } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to place order. Please check your connection and try again.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="checkout-modal__overlay" onClick={closeCheckout}>
      <div
        className="checkout-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkout-modal__header">
          <div>
            <div className="checkout-modal__eyebrow">
              <span className={`checkout-modal__step-dot checkout-modal__step-dot--active`} />
              <span className={`checkout-modal__step-dot ${step === 'review' ? 'checkout-modal__step-dot--active' : ''}`} />
              <span>{step === 'details' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
            </div>
            <h2 id="checkout-modal-title" className="checkout-modal__header-title">
              {step === 'details' ? 'Place Order' : 'Review Order'}
            </h2>
            <p className="checkout-modal__header-sub">
              {step === 'review'
                ? 'Confirm the details below before sending this order to Doughly Crumbl.'
                : isDelivery
                  ? 'Delivery fee will be confirmed by the seller before payment.'
                  : 'No delivery fee - pay at pickup or via your chosen payment method.'}
            </p>
          </div>
          <button
            className="checkout-modal__close-btn"
            onClick={closeCheckout}
            disabled={isSubmitting}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        <div className="checkout-modal__body">
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 'details' ? (
              <>
                <div className="checkout-section">
                  <h3 className="checkout-section__title">
                    <ShoppingBag size={15} /> Order Summary
                  </h3>
                  {items.map((item) => (
                    <div key={item.cartItemId} className="checkout-item-row">
                      <span className="checkout-item-row__name">
                        {item.productName}{' '}
                        <span className="checkout-item-row__qty">x {item.quantity}</span>
                      </span>
                      <span className="checkout-item-row__price">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                  <hr className="checkout-divider" />
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="checkout-summary-row checkout-summary-row--italic">
                    <span>Delivery fee</span>
                    <span>{isDelivery ? 'To be quoted' : 'N/A (Pickup)'}</span>
                  </div>
                  <div className="checkout-summary-total">
                    <span>Subtotal Due</span>
                    <span className="checkout-summary-total__amount">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <div className="checkout-section">
                  <h3 className="checkout-section__title">Fulfillment Method</h3>
                  <div className="checkout-fulfillment-row">
                    {(['PICKUP', 'DELIVERY'] as FulfillmentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleFulfillmentChange(method)}
                        className={`checkout-fulfillment-btn ${fulfillmentMethod === method ? 'checkout-fulfillment-btn--active' : 'checkout-fulfillment-btn--inactive'}`}
                      >
                        {method === 'PICKUP' ? 'Pickup' : 'Delivery'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="checkout-section">
                  <h3 className="checkout-section__title">
                    {isDelivery ? 'Delivery Details' : 'Pickup Details'}
                  </h3>
                  <div className="checkout-field">
                    {isDelivery ? (
                      <>
                        <div>
                          <label className="checkout-field-label">
                            <MapPin size={13} /> Street Address{' '}
                            <span className="checkout-field-label--required">*</span>
                          </label>
                          <input
                            className={`checkout-input ${fieldErrors.street ? 'checkout-input--error' : ''}`}
                            type="text"
                            placeholder="House/Unit No., Street Name"
                            value={street}
                            onChange={(e) => {
                              setStreet(e.target.value);
                              setFieldErrors((p) => ({ ...p, street: undefined }));
                            }}
                          />
                          {fieldErrors.street && <span className="checkout-field-error">{fieldErrors.street}</span>}
                        </div>

                        <div className="checkout-grid-2">
                          <div>
                            <label className="checkout-field-label">
                              Barangay <span className="checkout-field-label--required">*</span>
                            </label>
                            <input
                              className={`checkout-input ${fieldErrors.barangay ? 'checkout-input--error' : ''}`}
                              type="text"
                              value={barangay}
                              onChange={(e) => {
                                setBarangay(e.target.value);
                                setFieldErrors((p) => ({ ...p, barangay: undefined }));
                              }}
                            />
                            {fieldErrors.barangay && <span className="checkout-field-error">{fieldErrors.barangay}</span>}
                          </div>
                          <div>
                            <label className="checkout-field-label">
                              City <span className="checkout-field-label--required">*</span>
                            </label>
                            <input
                              className={`checkout-input ${fieldErrors.city ? 'checkout-input--error' : ''}`}
                              type="text"
                              value={city}
                              onChange={(e) => {
                                setCity(e.target.value);
                                setFieldErrors((p) => ({ ...p, city: undefined }));
                              }}
                            />
                            {fieldErrors.city && <span className="checkout-field-error">{fieldErrors.city}</span>}
                          </div>
                        </div>

                        <div>
                          <label className="checkout-field-label">
                            Landmark <span className="checkout-field-optional">(Optional - helps the rider find you)</span>
                          </label>
                          <input
                            className="checkout-input"
                            type="text"
                            placeholder="Near school, church, building..."
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                          />
                        </div>

                        <div className="checkout-notice checkout-notice--warning">
                          Delivery fee will be quoted by the seller based on your location and reflected in your total before payment.
                        </div>
                      </>
                    ) : (
                      <div className="checkout-notice checkout-notice--info">
                        Pickup at: Don Gil Garcia St., Capitol Site, Cebu City
                      </div>
                    )}

                    <div>
                      <label className="checkout-field-label">
                        <Phone size={13} /> Contact Number{' '}
                        <span className="checkout-field-label--required">*</span>
                      </label>
                      <input
                        className={`checkout-input ${fieldErrors.phone ? 'checkout-input--error' : ''}`}
                        type="tel"
                        placeholder="09171234567"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setFieldErrors((p) => ({ ...p, phone: undefined }));
                        }}
                      />
                      {fieldErrors.phone && <span className="checkout-field-error">{fieldErrors.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="checkout-section">
                  <h3 className="checkout-section__title">Payment Method</h3>
                  <p className="checkout-payment-hint">
                    {isDelivery
                      ? 'QR code and exact amount will be provided after the seller confirms the delivery fee.'
                      : paymentMethod === 'CASH_ON_PICKUP'
                        ? 'Pay in cash when you arrive at the store. No online payment needed.'
                        : 'QR code will be shown in your order detail after placing.'}
                  </p>
                  <div className="checkout-payment-methods">
                    {availablePaymentMethods.map((method) => (
                      <label
                        key={method}
                        className={`checkout-payment-option ${paymentMethod === method ? 'checkout-payment-option--active' : 'checkout-payment-option--inactive'}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                        />
                        <span className={`checkout-payment-option__label ${paymentMethod === method ? 'checkout-payment-option__label--active' : ''}`}>
                          {PAYMENT_LABELS[method]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="checkout-notes-wrap">
                  <label className="checkout-field-label">
                    <FileText size={13} /> Order Notes <span className="checkout-field-optional">(Optional)</span>
                  </label>
                  <textarea
                    className="checkout-input checkout-textarea"
                    placeholder="Any special instructions for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleReviewOrder}
                  disabled={isSubmitting || items.length === 0}
                  className="checkout-submit-btn"
                >
                  Review Order
                </button>
              </>
            ) : (
              <div className="checkout-review">
                <div className="checkout-review__hero">
                  <div className="checkout-review__icon">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3>Final check before we bake</h3>
                    <p>Your order is not submitted yet. Review the fulfillment, payment, and totals below.</p>
                  </div>
                </div>

                {submitError && (
                  <div className="checkout-review__error" role="alert">
                    {submitError}
                  </div>
                )}

                <div className="checkout-review__grid">
                  <div className="checkout-review__card">
                    <span>Fulfillment</span>
                    <strong>{isDelivery ? 'Delivery' : 'Pickup'}</strong>
                    <small>{deliveryAddressPreview || 'Address will appear here once completed.'}</small>
                    {isDelivery && landmark.trim() && <small>Landmark: {landmark.trim()}</small>}
                  </div>
                  <div className="checkout-review__card">
                    <span>Contact</span>
                    <strong>{phone.trim()}</strong>
                    <small>Payment via {PAYMENT_LABELS[paymentMethod]}</small>
                  </div>
                </div>

                <div className="checkout-section checkout-section--review">
                  <h3 className="checkout-section__title">
                    <ShoppingBag size={15} /> Items
                  </h3>
                  {items.map((item) => (
                    <div key={item.cartItemId} className="checkout-item-row">
                      <span className="checkout-item-row__name">
                        {item.productName}{' '}
                        <span className="checkout-item-row__qty">x {item.quantity}</span>
                      </span>
                      <span className="checkout-item-row__price">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                  <hr className="checkout-divider" />
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="checkout-summary-row checkout-summary-row--italic">
                    <span>Delivery fee</span>
                    <span>{isDelivery ? 'To be quoted' : 'N/A (Pickup)'}</span>
                  </div>
                  <div className="checkout-summary-total">
                    <span>{isDelivery ? 'Subtotal due now' : 'Total'}</span>
                    <span className="checkout-summary-total__amount">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <div className="checkout-review__notice">
                  <CheckCircle size={16} />
                  <span>
                    {isDelivery
                      ? 'The seller will quote the delivery fee and notify you before payment is collected.'
                      : 'Your pickup order will be prepared after submission. Follow updates in My Orders.'}
                  </span>
                </div>

                <div className="checkout-review__actions">
                  <button
                    type="button"
                    className="checkout-review__back"
                    onClick={() => setStep('details')}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={16} /> Edit Details
                  </button>
                  <button
                    type="button"
                    className="checkout-submit-btn checkout-submit-btn--review"
                    onClick={confirmPlaceOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <span className="spinner-small" /> : 'Confirm & Place'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
