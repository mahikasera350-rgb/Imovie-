import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import TicketPass from '../components/booking/TicketPass';
import { CheckCircle2, Ticket, ArrowLeft, Home } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        setBooking(res.data.booking);
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket confirmation...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking details not found</h4>
        <Link to="/" className="btn btn-cinema-red mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-2">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="fw-bold text-light mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small">
          Your cinema seats have been secured. Present your digital ticket pass at the theatre gate.
        </p>
      </div>

      {/* Ticket Pass Component */}
      <TicketPass booking={booking} />

      {/* Navigation Actions */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-4">
        <Link to="/dashboard" className="btn btn-cinema-outline d-flex align-items-center gap-2 px-4 py-2">
          <Ticket size={16} />
          View My Bookings
        </Link>
        <Link to="/" className="btn btn-cinema-red d-flex align-items-center gap-2 px-4 py-2">
          <Home size={16} />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
