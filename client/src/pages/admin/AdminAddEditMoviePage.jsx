import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import movieService from '../../services/movieService';
import { Clapperboard, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminAddEditMoviePage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    genres: 'Action, Sci-Fi',
    languages: 'English',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    cast: 'Lead Actor, Supporting Actor',
    director: '',
    certification: 'UA',
    rating: 8.0,
    status: 'now_showing',
    featured: false,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchMovie = async () => {
        try {
          const res = await movieService.getMovieById(id);
          const m = res.data.movie;
          setFormData({
            title: m.title || '',
            description: m.description || '',
            posterUrl: m.posterUrl || '',
            bannerUrl: m.bannerUrl || '',
            trailerUrl: m.trailerUrl || '',
            genres: m.genres?.join(', ') || '',
            languages: m.languages?.join(', ') || '',
            duration: m.duration || 120,
            releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : '',
            cast: m.cast?.join(', ') || '',
            director: m.director || '',
            certification: m.certification || 'UA',
            rating: m.rating || 8.0,
            status: m.status || 'now_showing',
            featured: Boolean(m.featured),
          });
        } catch (err) {
          toast.error('Failed to load movie for editing');
          navigate('/admin/movies');
        } finally {
          setFetching(false);
        }
      };
      fetchMovie();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((l) => l.trim()).filter(Boolean),
        cast: formData.cast.split(',').map((c) => c.trim()).filter(Boolean),
        duration: Number(formData.duration),
        rating: Number(formData.rating),
      };

      if (isEdit) {
        await movieService.updateMovie(id, payload);
        toast.success('Movie updated successfully');
      } else {
        await movieService.createMovie(payload);
        toast.success('New movie created successfully');
      }

      navigate('/admin/movies');
    } catch (err) {
      toast.error(err.message || 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading movie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: '840px' }}>
      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <Link to="/admin/movies" className="btn btn-sm btn-cinema-outline p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="fw-bold text-light mb-0">
            {isEdit ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <p className="text-secondary small mb-0">Fill in movie metadata and poster details</p>
        </div>
      </div>

      <div className="card bg-cinematic-card border-secondary text-light p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label small text-secondary fw-semibold">Movie Title</label>
              <input
                type="text"
                required
                name="title"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="e.g. Dune: Part Two"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Status</label>
              <select
                name="status"
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label small text-secondary fw-semibold">Description / Synopsis</label>
            <textarea
              rows="3"
              required
              name="description"
              className="form-control form-control-sm bg-dark border-secondary text-light py-2"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Poster Image URL</label>
              <input
                type="url"
                required
                name="posterUrl"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="https://..."
                value={formData.posterUrl}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Banner Image URL</label>
              <input
                type="url"
                name="bannerUrl"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="https://..."
                value={formData.bannerUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Genres (comma separated)</label>
              <input
                type="text"
                required
                name="genres"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="Action, Sci-Fi"
                value={formData.genres}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Languages (comma separated)</label>
              <input
                type="text"
                required
                name="languages"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="English, Spanish"
                value={formData.languages}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                required
                name="duration"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Director</label>
              <input
                type="text"
                required
                name="director"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.director}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Certification</label>
              <select
                name="certification"
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.certification}
                onChange={handleChange}
              >
                <option value="U">U (All Ages)</option>
                <option value="UA">UA (Parental Guidance)</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R (Restricted)</option>
                <option value="A">A (Adults Only)</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Rating (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label small text-secondary fw-semibold">Cast (comma separated)</label>
              <input
                type="text"
                name="cast"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="Actor 1, Actor 2"
                value={formData.cast}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Release Date</label>
              <input
                type="date"
                required
                name="releaseDate"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.releaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-check form-switch mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="featuredSwitch"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            <label className="form-check-label small text-light fw-semibold" htmlFor="featuredSwitch">
              Pin to Homepage Hero Premiere Banner
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
            <Link to="/admin/movies" className="btn btn-sm btn-cinema-outline px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-cinema-red px-4 d-flex align-items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : isEdit ? 'Update Movie' : 'Create Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEditMoviePage;
