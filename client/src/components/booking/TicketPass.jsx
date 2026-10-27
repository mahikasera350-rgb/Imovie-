import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { Film, MapPin, Calendar, Clock, Ticket, CheckCircle2, Printer } from 'lucide-react';

const TicketPass = ({ booking }) => {
  if (!booking) return null;

  const show = booking.showId;
  const movie = show?.movieId;
  const theatre = show?.theatreId;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-pass text-light p-4 p-md-5 my-4 mx-auto" style={{ maxWidth: '640px' }}>
      <div className="ticket-notch-left"></div>
      <div className="ticket-notch-right"></div>

      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-danger text-white rounded p-1.5 d-flex align-items-center justify-content-center">
            <Film size={20} />
          </div>
          <span className="brand-font fw-bold fs-5 tracking-wider">
            I<span className="text-danger">MOVIES</span> PASS
          </span>
        </div>
        <div className="d-flex align-items-center gap-1 text-success fw-bold small">
          <CheckCircle2 size={16} />
          <span>CONFIRMED</span>
        </div>
      </div>

      {/* Movie and Cinema */}
      <div className="row g-3 align-items-center mb-3">
        <div className="col-12 col-sm-8">
          <span className="badge bg-danger mb-1">{show?.format || 'Standard 2D'}</span>
          <h4 className="fw-bold text-light mb-1">{movie?.title}</h4>
          <p className="small text-secondary mb-0 d-flex align-items-center gap-1">
            <MapPin size={14} className="text-danger" />
            {theatre?.name}, {theatre?.city}
          </p>
        </div>
        <div className="col-12 col-sm-4 text-sm-end">
          <div className="small text-muted">Booking Reference</div>
          <div className="fw-mono fw-bold fs-5 text-warning tracking-wider">
            {booking.bookingReference}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="ticket-divider"></div>

      {/* Key Ticket Details */}
      <div className="row g-3 text-center mb-4">
        <div className="col-3 border-end border-secondary">
          <div className="small text-muted mb-1">DATE</div>
          <div className="fw-semibold small">{formatDate(show?.showDate).split(',')[1]}</div>
        </div>
        <div className="col-3 border-end border-secondary">
          <div className="small text-muted mb-1">TIME</div>
          <div className="fw-semibold small">{formatTime(show?.startTime)}</div>
        </div>
        <div className="col-3 border-end border-secondary">
          <div className="small text-muted mb-1">SCREEN</div>
          <div className="fw-semibold small">{show?.screenName || show?.screenNumber}</div>
        </div>
        <div className="col-3">
          <div className="small text-muted mb-1">SEATS</div>
          <div className="fw-bold text-danger small">{booking.seatNumbers?.join(', ')}</div>
        </div>
      </div>

      {/* QR Code Barcode Representation */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-3 border-top border-secondary gap-3">
        <div className="text-muted small">
          <div>Customer: <span className="text-light">{booking.userId?.name || 'Customer'}</span></div>
          <div>Total Paid: <span className="text-success fw-bold">{formatCurrency(booking.totalAmount)}</span></div>
        </div>

        {/* Action Button */}
        <button
          className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-2 px-3 py-2"
          onClick={handlePrint}
        >
          <Printer size={16} />
          Print Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketPass;
