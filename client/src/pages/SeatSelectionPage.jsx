import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import showService from '../services/showService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { getSocket, joinShowRoom, leaveShowRoom } from '../services/socketService';
import SeatGrid from '../components/booking/SeatGrid';
import BookingSummaryCard from '../components/booking/BookingSummaryCard';
import { formatDate, formatTime } from '../utils/formatters';
import { Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [pricing, setPricing] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [holdToken, setHoldToken] = useState(() => localStorage.getItem(`hold_${showId}`) || '');
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Load show details and seats
  const fetchSeatsData = async () => {
    try {
      const [showRes, seatsRes] = await Promise.all([
        showService.getShowById(showId),
        showService.getShowSeats(showId, holdToken),
      ]);

      setShow(showRes.data.show);
      setPricing(seatsRes.data.pricing || showRes.data.show?.seatPricing || {});
      setSeats(seatsRes.data.seats || []);

      // If user previously held seats with holdToken, restore them
      const myHeld = (seatsRes.data.seats || [])
        .filter((s) => s.status === 'selected_by_me')
        .map((s) => s.seatNumber);
      if (myHeld.length > 0) {
        setSelectedSeats(myHeld);
      }
    } catch (err) {
      toast.error('Failed to load seats for this show');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatsData();

    // Socket.IO real-time synchronization
    const socket = getSocket();
    joinShowRoom(showId);

    const handleSeatsHeld = ({ showId: sId, seatNumbers }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((seat) =>
            seatNumbers.includes(seat.seatNumber) && !selectedSeats.includes(seat.seatNumber)
              ? { ...seat, status: 'held' }
              : seat
          )
        );
      }
    };

    const handleSeatsReleased = ({ showId: sId, seatNumbers }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((seat) =>
            seatNumbers.includes(seat.seatNumber)
              ? { ...seat, status: 'available' }
              : seat
          )
        );
      }
    };

    const handleSeatsBooked = ({ showId: sId, seatNumbers }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((seat) =>
            seatNumbers.includes(seat.seatNumber)
              ? { ...seat, status: 'booked' }
              : seat
          )
        );
      }
    };

    socket.on('seats_held', handleSeatsHeld);
    socket.on('seats_released', handleSeatsReleased);
    socket.on('seats_booked', handleSeatsBooked);

    return () => {
      leaveShowRoom(showId);
      socket.off('seats_held', handleSeatsHeld);
      socket.off('seats_released', handleSeatsReleased);
      socket.off('seats_booked', handleSeatsBooked);
    };
  }, [showId]);

  // Hold Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = new Date(holdExpiresAt).getTime() - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        toast.warning('Your temporary seat hold has expired. Please re-select your seats.');
        setSelectedSeats([]);
        setHoldExpiresAt(null);
        setHoldToken('');
        localStorage.removeItem(`hold_${showId}`);
        fetchSeatsData();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, showId]);

  const handleToggleSeat = (seatNumber) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      }
      if (prev.length >= 8) {
        toast.info('You can select a maximum of 8 seats per booking');
        return prev;
      }
      return [...prev, seatNumber];
    });
  };

  // Calculate pricing breakdown
  const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.seatNumber));
  const subtotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? parseFloat((selectedSeats.length * 1.5).toFixed(2)) : 0;
  const taxes = parseFloat(((subtotal + convenienceFee) * 0.1).toFixed(2));
  const totalAmount = parseFloat((subtotal + convenienceFee + taxes).toFixed(2));

  const calculatedPricing = {
    subtotal,
    convenienceFee,
    taxes,
    totalAmount,
  };

  // Proceed to hold and booking summary
  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.info('Please select at least one seat to continue');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please log in to finalize your booking');
      navigate(`/login?redirect=/seats/${showId}`);
      return;
    }

    setHolding(true);
    try {
      const res = await bookingService.holdSeats({
        showId,
        seatNumbers: selectedSeats,
        holdToken: holdToken || undefined,
      });

      const newHoldToken = res.data.holdToken;
      setHoldToken(newHoldToken);
      localStorage.setItem(`hold_${showId}`, newHoldToken);
      setHoldExpiresAt(res.data.holdExpiresAt);

      // Save state to sessionStorage for Summary & Checkout
      sessionStorage.setItem(
        'current_booking_intent',
        JSON.stringify({
          showId,
          show,
          seatNumbers: selectedSeats,
          holdToken: newHoldToken,
          holdExpiresAt: res.data.holdExpiresAt,
          pricing: res.data.pricing || calculatedPricing,
        })
      );

      navigate('/booking/summary');
    } catch (err) {
      toast.error(err.message || 'Selected seats are no longer available. Please select other seats.');
      fetchSeatsData();
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading seats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Navigation Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-cinema-outline p-2"
            onClick={() => navigate(`/movies/${show?.movieId?._id}`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="fw-bold text-light mb-0">{show?.movieId?.title}</h3>
            <div className="small text-secondary">
              {show?.theatreId?.name} • {show?.screenName || `Screen ${show?.screenNumber}`} •{' '}
              {formatDate(show?.showDate)} at {formatTime(show?.startTime)}
            </div>
          </div>
        </div>

        {/* Hold Countdown Badge */}
        {timeLeft && (
          <div className="badge bg-warning text-dark px-3 py-2 d-flex align-items-center gap-2 fs-6 shadow-sm">
            <Clock size={16} />
            <span>Hold Timer: {timeLeft}</span>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Main Seat Grid Column */}
        <div className="col-12 col-lg-8">
          <div className="p-3 p-md-4 rounded-3 bg-cinematic-secondary border border-secondary">
            <SeatGrid
              seats={seats}
              selectedSeats={selectedSeats}
              pricing={pricing}
              onToggleSeat={handleToggleSeat}
            />
          </div>
        </div>

        {/* Summary & Checkout Sidebar */}
        <div className="col-12 col-lg-4">
          <BookingSummaryCard
            movie={show?.movieId}
            theatre={show?.theatreId}
            show={show}
            selectedSeats={selectedSeats}
            pricing={calculatedPricing}
            onConfirm={handleProceed}
            loading={holding}
            btnText="Confirm & Review Summary"
          />
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
