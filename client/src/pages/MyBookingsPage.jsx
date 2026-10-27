import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { Ticket, Film, MapPin, Calendar, Clock, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.bookingStatus === filterStatus;
  });

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(cancellingBooking._id, cancelReason);
      toast.success('Booking cancelled and refund initiated successfully');
      setCancellingBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Ticket className="text-danger" size={26} />
            My Bookings & Tickets
          </h2>
          <p className="text-secondary small mb-0">
            View all your cinema reservations, download digital passes, or cancel eligible tickets
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm px-3 ${filterStatus === 'all' ? 'btn-cinema-red' : 'btn-cinema-outline'}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm px-3 ${filterStatus === 'confirmed' ? 'btn-cinema-red' : 'btn-cinema-outline'}`}
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmed ({bookings.filter((b) => b.bookingStatus === 'confirmed').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm px-3 ${filterStatus === 'cancelled' ? 'btn-cinema-red' : 'btn-cinema-outline'}`}
            onClick={() => setFilterStatus('cancelled')}
          >
            Cancelled ({bookings.filter((b) => b.bookingStatus === 'cancelled').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded-3 border border-secondary">
          <Ticket size={48} className="text-secondary mb-3" />
          <h4 className="text-light">No bookings found</h4>
          <p className="text-secondary small mb-4">No records match the selected filter.</p>
          <Link to="/movies" className="btn btn-cinema-red btn-sm px-4">
            Book New Tickets
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookings.map((b) => {
            const show = b.showId;
            const movie = show?.movieId;
            const theatre = show?.theatreId;
            const isConfirmed = b.bookingStatus === 'confirmed';
            const showHasStarted = show?.startTime && new Date(show.startTime) <= new Date();

            return (
              <div key={b._id} className="col-12">
                <div className="p-4 rounded-3 bg-cinematic-card border border-secondary shadow-sm">
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-2 text-center text-md-start">
                      <img
                        src={movie?.posterUrl}
                        alt={movie?.title}
                        className="rounded-3 shadow-sm border border-secondary"
                        style={{ width: '90px', height: '130px', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className={`badge ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-success'
                              : b.bookingStatus === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {b.bookingStatus?.toUpperCase()}
                        </span>
                        <span className="badge bg-secondary">{show?.format || 'Standard'}</span>
                        <span className="small text-muted">Ref: {b.bookingReference}</span>
                      </div>

                      <h4 className="fw-bold text-light mb-1">{movie?.title}</h4>
                      <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-danger" />
                        {theatre?.name}, {theatre?.city}
                      </div>

                      <div className="d-flex flex-wrap gap-3 small text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={14} /> {formatDate(show?.showDate)}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={14} /> {formatTime(show?.startTime)}
                        </span>
                        <span>Auditorium: {show?.screenName || `Screen ${show?.screenNumber}`}</span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4 text-md-end border-top border-md-top-0 pt-3 pt-md-0 border-secondary">
                      <div className="small text-muted mb-1">Seats Booked:</div>
                      <div className="fw-bold text-danger fs-5 mb-2">
                        {b.seatNumbers?.join(', ')}
                      </div>
                      <div className="small text-secondary mb-3">
                        Total Amount: <strong className="text-success fs-6">{formatCurrency(b.totalAmount)}</strong>
                      </div>

                      <div className="d-flex justify-content-md-end gap-2">
                        <Link
                          to={`/bookings/${b._id}`}
                          className="btn btn-sm btn-cinema-outline px-3"
                        >
                          View Pass
                        </Link>
                        {isConfirmed && !showHasStarted && (
                          <button
                            className="btn btn-sm btn-outline-danger px-3"
                            onClick={() => setCancellingBooking(b)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-cinematic-card border-secondary text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title d-flex align-items-center gap-2 text-danger">
                  <AlertTriangle size={20} />
                  Confirm Cancellation
                </h5>
                <button
                  type="button"
                  className="btn text-secondary p-0"
                  onClick={() => setCancellingBooking(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body py-4">
                <p className="text-secondary small mb-3">
                  Are you sure you want to cancel your booking for{' '}
                  <strong className="text-light">
                    {cancellingBooking.showId?.movieId?.title}
                  </strong>{' '}
                  (Seats: {cancellingBooking.seatNumbers?.join(', ')})?
                </p>

                <div className="p-3 rounded bg-dark border border-secondary small text-secondary mb-3">
                  <div>Refund Amount: <strong className="text-success">{formatCurrency(cancellingBooking.totalAmount)}</strong></div>
                  <div>Seats will be released back to the live theatre map instantly.</div>
                </div>

                <div className="mb-2">
                  <label className="form-label small text-secondary">Reason for Cancellation (Optional)</label>
                  <textarea
                    rows="2"
                    className="form-control form-control-sm bg-dark border-secondary text-light"
                    placeholder="Change of plans, schedule conflict, etc."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-sm btn-cinema-outline"
                  onClick={() => setCancellingBooking(null)}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger px-3"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
