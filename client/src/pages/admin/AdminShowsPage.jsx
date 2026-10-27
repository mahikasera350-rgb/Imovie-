import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import showService from '../../services/showService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { Calendar, Plus, Trash2, X, Film, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminShowsPage = () => {
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await showService.getShows();
      setShows(res.data.shows || []);
    } catch (err) {
      toast.error('Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await showService.deleteShow(deleteTarget._id);
      toast.success('Show and seat inventory deleted');
      setDeleteTarget(null);
      fetchShows();
    } catch (err) {
      toast.error(err.message || 'Cannot delete show with active bookings');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Calendar className="text-danger" size={26} />
            Manage Showtimes & Schedules
          </h2>
          <p className="text-secondary small mb-0">Schedule screenings, set seat tier pricing, and prevent overlapping times</p>
        </div>

        <Link to="/admin/shows/add" className="btn btn-cinema-red btn-sm d-flex align-items-center gap-1.5 px-3 py-2">
          <Plus size={16} />
          <span>Schedule New Show</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading scheduled shows...</span>
          </div>
        </div>
      ) : shows.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded border border-secondary">
          <p className="text-secondary small mb-0">No active shows scheduled yet.</p>
        </div>
      ) : (
        <div className="card bg-cinematic-card border-secondary text-light shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover table-borderless align-middle small mb-0">
              <thead className="border-bottom border-secondary text-secondary">
                <tr>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Screen</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>Format</th>
                  <th>Pricing (Reg / Prem / Rec)</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong className="text-light">{s.movieId?.title || 'Unknown Movie'}</strong>
                    </td>
                    <td>{s.theatreId?.name} ({s.theatreId?.city})</td>
                    <td>{s.screenName || `Screen ${s.screenNumber}`}</td>
                    <td>{formatDate(s.showDate)}</td>
                    <td className="fw-semibold text-warning">{formatTime(s.startTime)}</td>
                    <td>
                      <span className="badge bg-secondary">{s.format}</span>
                    </td>
                    <td>
                      <span className="small text-secondary">
                        {formatCurrency(s.seatPricing?.regular)} / {formatCurrency(s.seatPricing?.premium)} / {formatCurrency(s.seatPricing?.recliner)}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm text-danger p-1.5"
                        onClick={() => setDeleteTarget(s)}
                        title="Delete show"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-cinematic-card border-secondary text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-danger">Confirm Cancellation / Deletion</h5>
                <button type="button" className="btn text-secondary p-0" onClick={() => setDeleteTarget(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body py-4">
                Are you sure you want to delete show for <strong className="text-light">{deleteTarget.movieId?.title}</strong> on {formatDate(deleteTarget.showDate)} at {formatTime(deleteTarget.startTime)}?
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-sm btn-cinema-outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-sm btn-danger px-3" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Show'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
