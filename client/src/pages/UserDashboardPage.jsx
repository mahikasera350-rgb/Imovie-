import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import {
  Ticket,
  User,
  Calendar,
  Shield,
  ArrowRight,
  Clock,
  Film,
  MapPin,
  Bell,
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const res = await bookingService.getMyBookings();
        setRecentBookings(res.data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const confirmedCount = recentBookings.filter((b) => b.bookingStatus === 'confirmed').length;

  return (
    <div className="container py-5">
      {/* Welcome Banner */}
      <div className="p-4 p-md-5 rounded-4 bg-cinematic-card border border-secondary mb-5 position-relative overflow-hidden">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '56px', height: '56px' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="fw-bold text-light mb-0">{user?.name}</h2>
                <div className="small text-secondary">{user?.email} • Preferred City: {user?.city || 'New York'}</div>
              </div>
            </div>
            <p className="text-secondary small mt-3 mb-0" style={{ maxWidth: '540px' }}>
              Welcome to your personal cinema dashboard. View your active tickets, browse booking history, and manage your account settings.
            </p>
          </div>

          <div className="col-12 col-md-4 mt-3 mt-md-0 text-md-end">
            <div className="d-flex justify-content-md-end gap-2">
              <Link to="/profile" className="btn btn-sm btn-cinema-outline">
                Edit Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1">
                  <Shield size={14} />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-4">
          <div className="p-4 rounded-3 bg-cinematic-card border border-secondary">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-secondary fw-semibold">Active Confirmed Tickets</span>
              <Ticket className="text-danger" size={20} />
            </div>
            <h3 className="fw-bold text-light mb-0">{confirmedCount}</h3>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="p-4 rounded-3 bg-cinematic-card border border-secondary">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-secondary fw-semibold">Total Bookings</span>
              <Calendar className="text-primary" size={20} />
            </div>
            <h3 className="fw-bold text-light mb-0">{recentBookings.length}</h3>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="p-4 rounded-3 bg-cinematic-card border border-secondary">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-secondary fw-semibold">Rewards & Club Tier</span>
              <Film className="text-warning" size={20} />
            </div>
            <h3 className="fw-bold text-warning mb-0">VIP Member</h3>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-light mb-1">Recent Booking History</h4>
          <p className="text-secondary small mb-0">Your latest ticket purchases and confirmations</p>
        </div>
        <Link to="/my-bookings" className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1">
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : recentBookings.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded-3 border border-secondary">
          <Ticket size={40} className="text-secondary mb-2" />
          <h5 className="text-light">No bookings found</h5>
          <p className="text-secondary small mb-3">You haven't booked any movie tickets yet.</p>
          <Link to="/movies" className="btn btn-cinema-red btn-sm px-4">
            Browse Movies & Showtimes
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {recentBookings.slice(0, 4).map((booking) => {
            const show = booking.showId;
            const movie = show?.movieId;
            const theatre = show?.theatreId;

            return (
              <div key={booking._id} className="col-12">
                <div className="p-3.5 rounded-3 bg-cinematic-card border border-secondary d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={movie?.posterUrl}
                      alt={movie?.title}
                      style={{ width: '55px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-bold text-light mb-0">{movie?.title}</h6>
                        <span
                          className={`badge ${
                            booking.bookingStatus === 'confirmed'
                              ? 'bg-success'
                              : booking.bookingStatus === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {booking.bookingStatus?.toUpperCase()}
                        </span>
                      </div>
                      <div className="small text-secondary mb-1">
                        {theatre?.name} • Seats: <span className="text-light fw-bold">{booking.seatNumbers?.join(', ')}</span>
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-3">
                        <span>{formatDate(show?.showDate)}</span>
                        <span>{formatTime(show?.startTime)}</span>
                        <span className="text-success fw-bold">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Link
                      to={`/bookings/${booking._id}`}
                      className="btn btn-sm btn-cinema-outline px-3"
                    >
                      View Ticket Pass
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
