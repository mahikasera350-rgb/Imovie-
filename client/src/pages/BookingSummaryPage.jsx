import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { Ticket, Film, MapPin, Calendar, Clock, Tag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingSummaryPage = () => {
  const navigate = useNavigate();

  const [bookingIntent, setBookingIntent] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('current_booking_intent');
    if (!raw) {
      toast.info('No active booking selection found');
      navigate('/movies');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setBookingIntent(parsed);
    } catch (e) {
      navigate('/movies');
    }
  }, [navigate]);

  if (!bookingIntent) return null;

  const { show, seatNumbers, holdToken, pricing } = bookingIntent;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'IMOVIE10') {
      const disc = parseFloat((pricing.subtotal * 0.1).toFixed(2));
      setDiscount(disc);
      setPromoApplied(true);
      toast.success('Promo code IMOVIE10 applied! 10% discount added.');
    } else {
      toast.error('Invalid promo code. Try IMOVIE10');
    }
  };

  const finalTotal = Math.max(0, parseFloat((pricing.totalAmount - discount).toFixed(2)));

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // Generate unique idempotency key for this checkout attempt
      const idempotencyKey = `idem_${holdToken}_${seatNumbers.sort().join('_')}`;

      const res = await bookingService.createBooking({
        showId: show._id,
        holdToken,
        seatNumbers,
        idempotencyKey,
      });

      const booking = res.data.booking;

      // Update session storage with confirmed pending booking
      sessionStorage.setItem('current_active_booking', JSON.stringify(booking));

      navigate('/booking/payment');
    } catch (err) {
      toast.error(err.message || 'Booking creation failed. Your seat hold may have expired.');
      navigate(`/seats/${show._id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <Ticket className="text-danger" size={26} />
          Review & Confirm Booking
        </h2>
        <p className="text-secondary small mb-4">
          Please review your screening details and seat numbers before proceeding to secure checkout.
        </p>

        <div className="row g-4">
          {/* Screening Details */}
          <div className="col-12 col-md-7">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary mb-3">
              <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary">
                <img
                  src={show?.movieId?.posterUrl}
                  alt={show?.movieId?.title}
                  style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <span className="badge bg-danger mb-1">{show?.format || 'Standard 2D'}</span>
                  <h4 className="fw-bold text-light mb-1">{show?.movieId?.title}</h4>
                  <div className="small text-secondary">{show?.movieId?.genres?.join(', ')}</div>
                  <div className="small text-secondary mt-1">
                    Language: <span className="text-light">{show?.language || 'English'}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-2.5 small text-secondary">
                <div className="d-flex justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <MapPin size={15} className="text-danger" /> Cinema Theatre
                  </span>
                  <span className="text-light fw-medium">{show?.theatreId?.name}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <Calendar size={15} /> Show Date
                  </span>
                  <span className="text-light fw-medium">{formatDate(show?.showDate)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <Clock size={15} /> Showtime
                  </span>
                  <span className="text-light fw-medium">{formatTime(show?.startTime)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="d-flex align-items-center gap-2">
                    <Film size={15} /> Auditorium
                  </span>
                  <span className="text-light fw-medium">{show?.screenName || `Screen ${show?.screenNumber}`}</span>
                </div>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="p-3 rounded-3 bg-cinematic-card border border-secondary">
              <form onSubmit={handleApplyPromo} className="d-flex gap-2">
                <div className="position-relative flex-grow-1">
                  <input
                    type="text"
                    disabled={promoApplied}
                    className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2 text-uppercase"
                    placeholder="Enter Coupon (e.g. IMOVIE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Tag size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
                <button
                  type="submit"
                  disabled={promoApplied || !promoCode.trim()}
                  className="btn btn-sm btn-cinema-outline text-nowrap px-3"
                >
                  {promoApplied ? <Check size={16} className="text-success" /> : 'Apply'}
                </button>
              </form>
              {promoApplied && (
                <div className="text-success small mt-2 d-flex align-items-center gap-1">
                  <Check size={14} /> Coupon IMOVIE10 applied: 10% off ticket subtotal!
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Checkout Column */}
          <div className="col-12 col-md-5">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold text-light mb-3">Selected Seats ({seatNumbers.length})</h5>
                <div className="d-flex flex-wrap gap-1.5 mb-4 pb-3 border-bottom border-secondary">
                  {seatNumbers.map((seat) => (
                    <span key={seat} className="badge bg-dark border border-danger text-light px-2.5 py-1.5 fs-6">
                      {seat}
                    </span>
                  ))}
                </div>

                <div className="d-flex flex-column gap-2 small text-secondary mb-4 pb-3 border-bottom border-secondary">
                  <div className="d-flex justify-content-between">
                    <span>Base Ticket Fare</span>
                    <span className="text-light">{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Convenience Fee</span>
                    <span className="text-light">{formatCurrency(pricing.convenienceFee)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Taxes & GST</span>
                    <span className="text-light">{formatCurrency(pricing.taxes)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between text-success fw-bold">
                      <span>Promo Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between pt-2 border-top border-secondary fs-5 fw-bold text-light">
                    <span>Payable Amount</span>
                    <span className="text-danger">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 small text-secondary mb-4">
                  <ShieldCheck size={16} className="text-success" />
                  <span>Verified Safe & Instant Ticket Issuance</span>
                </div>
              </div>

              <button
                className="btn btn-cinema-red w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handleProceedToPayment}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <ArrowRight size={18} />
                )}
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryPage;
