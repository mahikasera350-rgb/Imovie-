import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import TicketPass from '../components/booking/TicketPass';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(id);
        setBooking(res.data.booking);
      } catch (err) {
        toast.error('Booking not found or access denied');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/my-bookings" className="btn btn-sm btn-cinema-outline p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 className="fw-bold text-light mb-0">Booking Details</h3>
          <div className="small text-secondary">Reference: {booking.bookingReference}</div>
        </div>
      </div>

      <TicketPass booking={booking} />
    </div>
  );
};

export default BookingDetailPage;
