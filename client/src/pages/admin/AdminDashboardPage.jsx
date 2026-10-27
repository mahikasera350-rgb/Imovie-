import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Users,
  Clapperboard,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading admin metrics...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentBookings = data?.recentBookings || [];
  const recentLogs = data?.recentLogs || [];

  const metricCards = [
    { title: 'Total Revenue', value: formatCurrency(metrics.totalRevenue || 0), icon: DollarSign, color: 'text-success', bg: 'bg-success' },
    { title: 'Total Bookings', value: metrics.totalBookings || 0, icon: Ticket, color: 'text-danger', bg: 'bg-danger' },
    { title: 'Registered Users', value: metrics.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary' },
    { title: 'Active Movies', value: metrics.totalMovies || 0, icon: Clapperboard, color: 'text-warning', bg: 'bg-warning' },
    { title: 'Theatres & Cinemas', value: metrics.totalTheatres || 0, icon: Building2, color: 'text-info', bg: 'bg-info' },
    { title: 'Upcoming Shows', value: metrics.upcomingShows || 0, icon: Calendar, color: 'text-light', bg: 'bg-secondary' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-light mb-1">Administrative Overview</h2>
          <p className="text-secondary small mb-0">System health, box office revenue, and booking volume</p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="col-12 col-sm-6 col-xl-4">
              <div className="p-3.5 rounded-3 bg-cinematic-card border border-secondary d-flex align-items-center justify-content-between shadow-sm">
                <div>
                  <div className="small text-secondary fw-medium mb-1">{card.title}</div>
                  <h3 className="fw-bold text-light mb-0">{card.value}</h3>
                </div>
                <div
                  className={`p-3 rounded-3 ${card.bg} bg-opacity-10 ${card.color} d-flex align-items-center justify-content-center`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        {/* Recent Bookings Table */}
        <div className="col-12 col-lg-8">
          <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100">
            <h5 className="fw-bold text-light mb-3 d-flex align-items-center gap-2">
              <Ticket size={18} className="text-danger" />
              Recent Booking Transactions
            </h5>

            {recentBookings.length === 0 ? (
              <p className="text-secondary small">No bookings recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover table-borderless align-middle small mb-0">
                  <thead className="border-bottom border-secondary text-secondary">
                    <tr>
                      <th>Ref</th>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-mono text-warning">{b.bookingReference}</td>
                        <td className="text-light">{b.userId?.name || 'Customer'}</td>
                        <td className="text-truncate" style={{ maxWidth: '140px' }}>
                          {b.showId?.movieId?.title || 'Movie'}
                        </td>
                        <td>{b.seatNumbers?.join(', ')}</td>
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
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="col-12 col-lg-4">
          <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100">
            <h5 className="fw-bold text-light mb-3 d-flex align-items-center gap-2">
              <Activity size={18} className="text-warning" />
              Administrative Audit Log
            </h5>

            {recentLogs.length === 0 ? (
              <p className="text-secondary small">No audit actions logged yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {recentLogs.map((log) => (
                  <div key={log._id} className="p-2.5 rounded bg-dark border border-secondary small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-secondary text-light">{log.action}</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-light">
                      Target: <strong className="text-danger">{log.targetType}</strong>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      By: {log.adminId?.name || 'Administrator'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
