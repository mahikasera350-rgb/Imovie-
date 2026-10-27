import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import theatreService from '../../services/theatreService';
import { Building2, Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminTheatresPage = () => {
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const res = await theatreService.getTheatres();
      setTheatres(res.data.theatres || []);
    } catch (err) {
      toast.error('Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await theatreService.deleteTheatre(deleteTarget._id);
      toast.success(`Theatre "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchTheatres();
    } catch (err) {
      toast.error(err.message || 'Failed to delete theatre');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Building2 className="text-danger" size={26} />
            Manage Theatres & Screens
          </h2>
          <p className="text-secondary small mb-0">Configure multiplexes, auditoriums, and seat map dimensions</p>
        </div>

        <Link to="/admin/theatres/add" className="btn btn-cinema-red btn-sm d-flex align-items-center gap-1.5 px-3 py-2">
          <Plus size={16} />
          <span>Add New Theatre</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading theatres...</span>
          </div>
        </div>
      ) : theatres.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded border border-secondary">
          <p className="text-secondary small mb-0">No theatres registered yet.</p>
        </div>
      ) : (
        <div className="card bg-cinematic-card border-secondary text-light shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover table-borderless align-middle small mb-0">
              <thead className="border-bottom border-secondary text-secondary">
                <tr>
                  <th>Theatre Name</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Screens</th>
                  <th>Facilities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong className="text-light">{t.name}</strong>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-light">{t.city}</span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>{t.address}</td>
                    <td>
                      <span className="badge bg-danger">{t.screens?.length || 1} Screen(s)</span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {t.facilities?.join(', ')}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm text-info p-1.5"
                          onClick={() => navigate(`/admin/theatres/edit/${t._id}`)}
                          title="Edit theatre"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-sm text-danger p-1.5"
                          onClick={() => setDeleteTarget(t)}
                          title="Delete theatre"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-cinematic-card border-secondary text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-danger">Confirm Deletion</h5>
                <button type="button" className="btn text-secondary p-0" onClick={() => setDeleteTarget(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body py-4">
                Are you sure you want to delete <strong className="text-light">{deleteTarget.name}</strong>?
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-sm btn-cinema-outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-sm btn-danger px-3" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Theatre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatresPage;
