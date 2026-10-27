import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import movieService from '../../services/movieService';
import { formatDate } from '../../utils/formatters';
import { Clapperboard, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminMoviesPage = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await movieService.getMovies({ search: searchTerm, limit: 100 });
      setMovies(res.data.movies || []);
    } catch (err) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await movieService.deleteMovie(deleteTarget._id);
      toast.success(`Movie "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchMovies();
    } catch (err) {
      toast.error(err.message || 'Failed to delete movie');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Clapperboard className="text-danger" size={26} />
            Manage Movies
          </h2>
          <p className="text-secondary small mb-0">Create, edit, or archive movies from the catalogue</p>
        </div>

        <Link to="/admin/movies/add" className="btn btn-cinema-red btn-sm d-flex align-items-center gap-1.5 px-3 py-2">
          <Plus size={16} />
          <span>Add New Movie</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4 position-relative" style={{ maxWidth: '360px' }}>
        <input
          type="text"
          className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2"
          placeholder="Filter by title, genre, director..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading catalogue...</span>
          </div>
        </div>
      ) : movies.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded border border-secondary">
          <p className="text-secondary small mb-0">No movies found.</p>
        </div>
      ) : (
        <div className="card bg-cinematic-card border-secondary text-light shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover table-borderless align-middle small mb-0">
              <thead className="border-bottom border-secondary text-secondary">
                <tr>
                  <th style={{ width: '60px' }}>Poster</th>
                  <th>Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Release Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td>
                      <strong className="text-light d-block">{m.title}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Director: {m.director}
                      </span>
                    </td>
                    <td>{m.genres?.join(', ')}</td>
                    <td>{m.duration} mins</td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === 'now_showing' ? 'bg-success' : 'bg-primary'
                        }`}
                      >
                        {m.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{formatDate(m.releaseDate)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm text-info p-1.5"
                          onClick={() => navigate(`/admin/movies/edit/${m._id}`)}
                          title="Edit movie"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-sm text-danger p-1.5"
                          onClick={() => setDeleteTarget(m)}
                          title="Delete movie"
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

      {/* Delete Confirmation Modal */}
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
                Are you sure you want to delete <strong className="text-light">{deleteTarget.title}</strong> from the database? This action cannot be undone.
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-sm btn-cinema-outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-sm btn-danger px-3" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Movie'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
