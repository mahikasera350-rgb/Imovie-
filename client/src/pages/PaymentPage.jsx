import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { formatCurrency } from '../utils/formatters';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('demo'); // 'demo' | 'razorpay'
  const [demoScenario, setDemoScenario] = useState('success'); // 'success' | 'failure'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('current_active_booking');
    if (!raw) {
      toast.info('No active booking found to pay for');
      navigate('/movies');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setBooking(parsed);
    } catch (e) {
      navigate('/movies');
    }
  }, [navigate]);

  if (!booking) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create payment order on server
      const orderRes = await paymentService.createOrder(booking._id, paymentMode);

      if (paymentMode === 'demo') {
        // 2. Verify Demo Payment
        const simulateFailure = demoScenario === 'failure';
        const verifyRes = await paymentService.verifyPayment({
          bookingId: booking._id,
          provider: 'demo',
          providerOrderId: orderRes.data.orderId,
          simulateFailure,
          failureReason: simulateFailure ? 'Simulated Card Decline (Demo Mode)' : undefined,
        });

        toast.success('Payment approved! Ticket confirmed.');
        sessionStorage.removeItem('current_booking_intent');
        sessionStorage.removeItem('current_active_booking');
        navigate(`/confirmation/${booking._id}`);
      } else if (paymentMode === 'razorpay') {
        // If real Razorpay test credentials configured
        const options = {
          key: orderRes.data.key,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: 'IMovies Cinema Ticketing',
          description: `Booking ${booking.bookingReference}`,
          order_id: orderRes.data.orderId,
          handler: async function (response) {
            try {
              await paymentService.verifyPayment({
                bookingId: booking._id,
                provider: 'razorpay',
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              toast.success('Razorpay payment verified!');
              navigate(`/confirmation/${booking._id}`);
            } catch (vErr) {
              setErrorMessage(vErr.message || 'Signature verification failed');
            }
          },
          prefill: {
            name: booking.userId?.name || 'Customer',
            email: booking.userId?.email || 'user@imovies.com',
          },
          theme: {
            color: '#e50914',
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          throw new Error('Razorpay SDK script not loaded. Please use Demo Mode.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed');
      toast.error(err.message || 'Payment declined');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-2"
          >
            <Lock size={32} />
          </div>
          <h2 className="fw-bold text-light mb-1">Secure Checkout</h2>
          <p className="text-secondary small">
            Order Reference: <strong className="text-warning">{booking.bookingReference}</strong> • Total Payable:{' '}
            <strong className="text-success">{formatCurrency(booking.totalAmount)}</strong>
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <XCircle size={18} />
            <div>
              <strong>Payment Declined:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Mode Selector Card */}
        <div className="card bg-cinematic-card border-secondary text-light mb-4 shadow-sm">
          <div className="card-header border-secondary bg-transparent py-3">
            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <CreditCard className="text-danger" size={18} />
              Select Payment Method
            </h6>
          </div>

          <div className="card-body p-4">
            {/* Mode selection radio */}
            <div className="d-flex flex-column gap-3 mb-4">
              <div
                className={`p-3 rounded-3 border cursor-pointer transition-all ${
                  paymentMode === 'demo'
                    ? 'border-danger bg-danger bg-opacity-10'
                    : 'border-secondary bg-dark'
                }`}
                onClick={() => setPaymentMode('demo')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="payment_mode"
                      checked={paymentMode === 'demo'}
                      onChange={() => setPaymentMode('demo')}
                    />
                    <strong className="text-light">Development Demo Gateway (Simulated)</strong>
                  </div>
                  <span className="badge bg-success">Recommended for Testing</span>
                </div>
                <div className="small text-secondary ps-4">
                  Test the complete end-to-end booking lifecycle safely without real credit card charges.
                </div>
              </div>

              <div
                className={`p-3 rounded-3 border cursor-pointer transition-all ${
                  paymentMode === 'razorpay'
                    ? 'border-danger bg-danger bg-opacity-10'
                    : 'border-secondary bg-dark'
                }`}
                onClick={() => setPaymentMode('razorpay')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="payment_mode"
                      checked={paymentMode === 'razorpay'}
                      onChange={() => setPaymentMode('razorpay')}
                    />
                    <strong className="text-light">Razorpay Gateway (Test Mode)</strong>
                  </div>
                  <span className="badge bg-secondary">Sandbox Keys</span>
                </div>
                <div className="small text-secondary ps-4">
                  Uses Razorpay test mode if server environment variables are configured.
                </div>
              </div>
            </div>

            {/* If Demo Mode: Provide controlled Success / Failure toggles */}
            {paymentMode === 'demo' && (
              <div className="p-3 rounded bg-dark border border-secondary mb-4">
                <div className="small fw-bold text-warning mb-2 d-flex align-items-center gap-1">
                  <HelpCircle size={15} /> Demo Scenario Controller:
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${
                        demoScenario === 'success' ? 'btn-success' : 'btn-cinema-outline'
                      }`}
                      onClick={() => setDemoScenario('success')}
                    >
                      <CheckCircle2 size={16} />
                      Simulate Success
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${
                        demoScenario === 'failure' ? 'btn-danger' : 'btn-cinema-outline'
                      }`}
                      onClick={() => setDemoScenario('failure')}
                    >
                      <XCircle size={16} />
                      Simulate Failure
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              className="btn btn-cinema-red w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow"
              disabled={loading}
              onClick={handleProcessPayment}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <ShieldCheck size={20} />
              )}
              {paymentMode === 'demo'
                ? `Complete Demo Payment (${formatCurrency(booking.totalAmount)})`
                : `Pay ${formatCurrency(booking.totalAmount)} via Razorpay`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
