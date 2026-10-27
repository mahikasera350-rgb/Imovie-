import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { Film, MapPin, Calendar, Clock, Ticket } from 'lucide-react';

const BookingSummaryCard = ({
  movie,
  theatre,
  show,
  selectedSeats = [],
  pricing = {},
  onConfirm,
  loading = false,
  btnText = 'Proceed to Payment',
}) => {
  return (
    <div className="card bg-cinematic-card border-secondary text-light h-100 shadow-sm">
      <div className="card-header border-secondary bg-transparent py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <Ticket className="text-danger" size={20} />
          Booking Summary
        </h5>
      </div>

      <div className="card-body d-flex flex-column justify-content-between p-4">
        <div>
          {/* Movie Snippet */}
          <div className="d-flex gap-3 mb-4 pb-3 border-bottom border-secondary">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={{ width: '64px', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
              />
            )}
            <div>
              <h6 className="fw-bold text-light mb-1">{movie?.title}</h6>
              <span className="badge bg-secondary mb-2">{show?.format || 'Standard 2D'}</span>
              <div className="small text-muted d-flex align-items-center gap-1">
                <MapPin size={13} className="text-danger" />
                <span className="text-truncate" style={{ maxWidth: '200px' }}>
                  {theatre?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Show Timing */}
          <div className="small text-secondary mb-4 pb-3 border-bottom border-secondary d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2 text-muted">
                <Calendar size={15} /> Date
              </span>
              <span className="text-light fw-medium">{formatDate(show?.showDate)}</span>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2 text-muted">
                <Clock size={15} /> Time
              </span>
              <span className="text-light fw-medium">{formatTime(show?.startTime)}</span>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2 text-muted">
                <Film size={15} /> Screen
              </span>
              <span className="text-light fw-medium">{show?.screenName || `Audi ${show?.screenNumber}`}</span>
            </div>
          </div>

          {/* Seats Display */}
          <div className="mb-4 pb-3 border-bottom border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Selected Seats:</span>
              <span className="badge bg-danger">{selectedSeats.length} Seat(s)</span>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {selectedSeats.length === 0 ? (
                <span className="text-muted small italic">No seats selected yet</span>
              ) : (
                selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="badge bg-dark border border-secondary text-light px-2 py-1"
                  >
                    {seat}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          {selectedSeats.length > 0 && (
            <div className="small text-secondary mb-4 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span>Tickets Subtotal</span>
                <span className="text-light">{formatCurrency(pricing.subtotal || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee</span>
                <span className="text-light">{formatCurrency(pricing.convenienceFee || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Taxes & GST (10%)</span>
                <span className="text-light">{formatCurrency(pricing.taxes || 0)}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-secondary fw-bold fs-6 text-light">
                <span>Total Amount</span>
                <span className="text-danger fs-5">{formatCurrency(pricing.totalAmount || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="btn btn-cinema-red w-100 py-3 fw-bold mt-3 shadow-sm"
          disabled={selectedSeats.length === 0 || loading}
          onClick={onConfirm}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : null}
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
