import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { Ticket, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalResults: 0 });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings({ search, status, page, limit: 15 });
      setBookings(res.data.bookings || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, status, page]);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Ticket className="text-danger" size={26} />
            Manage Customer Bookings
          </h2>
          <p className="text-secondary small mb-0">Monitor ticket transactions, seat holds, and refund states</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-3 mb-4 rounded-3 bg-cinematic-card border border-secondary">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2"
                placeholder="Search by Booking Ref (e.g. IMV-)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <Search size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
            </div>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light py-2"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded border border-secondary">
          <p className="text-secondary small mb-0">No bookings found matching query.</p>
        </div>
      ) : (
        <div className="card bg-cinematic-card border-secondary text-light shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover table-borderless align-middle small mb-0">
              <thead className="border-bottom border-secondary text-secondary">
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Movie Title</th>
                  <th>Theatre & Screen</th>
                  <th>Seats</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="fw-mono text-warning fw-bold">{b.bookingReference}</span>
                    </td>
                    <td>
                      <div className="text-light fw-medium">{b.userId?.name || 'Customer'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{b.userId?.email}</div>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '160px' }}>
                      {b.showId?.movieId?.title || 'Movie'}
                    </td>
                    <td>
                      <div>{b.showId?.theatreId?.name || 'Theatre'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatDate(b.showId?.showDate)} at {formatTime(b.showId?.startTime)}
                      </div>
                    </td>
                    <td className="text-danger fw-bold">{b.seatNumbers?.join(', ')}</td>
                    <td className="text-success fw-bold">{formatCurrency(b.totalAmount)}</td>
                    <td>
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
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            className="btn btn-sm btn-cinema-outline px-3"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="small text-secondary px-2">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-sm btn-cinema-outline px-3"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
