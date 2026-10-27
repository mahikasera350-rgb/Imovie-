import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import showService from '../../services/showService';
import movieService from '../../services/movieService';
import theatreService from '../../services/theatreService';
import { Calendar, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminAddEditShowPage = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatre, setSelectedTheatre] = useState(null);

  const [formData, setFormData] = useState({
    movieId: '',
    theatreId: '',
    screenNumber: 1,
    screenName: 'Screen 1',
    showDate: new Date().toISOString().split('T')[0],
    startTimeOnly: '18:00',
    format: 'Standard 2D',
    language: 'English',
    seatPricing: {
      regular: 14.0,
      premium: 19.5,
      recliner: 26.0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [movRes, theRes] = await Promise.all([
          movieService.getMovies({ limit: 100 }),
          theatreService.getTheatres(),
        ]);

        const movList = movRes.data.movies || [];
        const theList = theRes.data.theatres || [];

        setMovies(movList);
        setTheatres(theList);

        if (movList.length > 0) {
          setFormData((prev) => ({ ...prev, movieId: movList[0]._id }));
        }

        if (theList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            theatreId: theList[0]._id,
            screenNumber: theList[0].screens?.[0]?.screenNumber || 1,
            screenName: theList[0].screens?.[0]?.name || 'Screen 1',
            format: theList[0].screens?.[0]?.format || 'Standard 2D',
          }));
          setSelectedTheatre(theList[0]);
        }
      } catch (err) {
        toast.error('Failed to load movies or theatres');
      } finally {
        setFetching(false);
      }
    };

    loadPrerequisites();
  }, []);

  const handleTheatreSelect = (e) => {
    const tId = e.target.value;
    const found = theatres.find((t) => t._id === tId);
    setSelectedTheatre(found);
    setFormData((prev) => ({
      ...prev,
      theatreId: tId,
      screenNumber: found?.screens?.[0]?.screenNumber || 1,
      screenName: found?.screens?.[0]?.name || 'Screen 1',
      format: found?.screens?.[0]?.format || 'Standard 2D',
    }));
  };

  const handleScreenSelect = (e) => {
    const sNum = parseInt(e.target.value, 10);
    const scr = selectedTheatre?.screens?.find((s) => s.screenNumber === sNum);
    setFormData((prev) => ({
      ...prev,
      screenNumber: sNum,
      screenName: scr?.name || `Screen ${sNum}`,
      format: scr?.format || 'Standard 2D',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedMovie = movies.find((m) => m._id === formData.movieId);
      const durationMins = selectedMovie?.duration || 120;

      // Construct startTime and endTime ISO timestamps
      const startDateTime = new Date(`${formData.showDate}T${formData.startTimeOnly}:00.000Z`);
      const endDateTime = new Date(startDateTime.getTime() + durationMins * 60 * 1000);

      await showService.createShow({
        movieId: formData.movieId,
        theatreId: formData.theatreId,
        screenNumber: formData.screenNumber,
        screenName: formData.screenName,
        showDate: formData.showDate,
        startTime: startDateTime,
        endTime: endDateTime,
        seatPricing: {
          regular: Number(formData.seatPricing.regular),
          premium: Number(formData.seatPricing.premium),
          recliner: Number(formData.seatPricing.recliner),
        },
        format: formData.format,
        language: formData.language,
      });

      toast.success('Show scheduled and seat inventory initialized successfully!');
      navigate('/admin/shows');
    } catch (err) {
      toast.error(err.message || 'Failed to schedule show (check for overlapping conflicts)');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <Link to="/admin/shows" className="btn btn-sm btn-cinema-outline p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="fw-bold text-light mb-0">Schedule New Show</h2>
          <p className="text-secondary small mb-0">
            Set screening times, format, and seat pricing. Automatic overlap prevention is enforced.
          </p>
        </div>
      </div>

      <div className="card bg-cinematic-card border-secondary text-light p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Select Movie</label>
              <select
                required
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.movieId}
                onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.duration} mins)
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Select Theatre Venue</label>
              <select
                required
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.theatreId}
                onChange={handleTheatreSelect}
              >
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Screen Auditorium</label>
              <select
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.screenNumber}
                onChange={handleScreenSelect}
              >
                {selectedTheatre?.screens?.map((s) => (
                  <option key={s.screenNumber} value={s.screenNumber}>
                    #{s.screenNumber} - {s.name} ({s.format})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Show Date</label>
              <input
                type="date"
                required
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Start Time (UTC/Local)</label>
              <input
                type="time"
                required
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.startTimeOnly}
                onChange={(e) => setFormData({ ...formData, startTimeOnly: e.target.value })}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Experience Format</label>
              <select
                className="form-select form-select-sm bg-dark border-secondary text-light py-2"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              >
                <option value="Standard 2D">Standard 2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
                <option value="Dolby Cinema">Dolby Cinema</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-secondary fw-semibold">Audio / Language</label>
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              />
            </div>
          </div>

          {/* Seat Pricing Tier Inputs */}
          <div className="pt-3 border-top border-secondary">
            <h6 className="fw-bold text-light mb-3">Tiered Seat Pricing ($ USD)</h6>
            <div className="row g-3">
              <div className="col-4">
                <label className="form-label small text-secondary">Regular Seat ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                  value={formData.seatPricing.regular}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seatPricing: { ...formData.seatPricing, regular: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="col-4">
                <label className="form-label small text-secondary">Premium Seat ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                  value={formData.seatPricing.premium}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seatPricing: { ...formData.seatPricing, premium: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="col-4">
                <label className="form-label small text-secondary">VIP Recliner ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                  value={formData.seatPricing.recliner}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seatPricing: { ...formData.seatPricing, recliner: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
            <Link to="/admin/shows" className="btn btn-sm btn-cinema-outline px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-cinema-red px-4 d-flex align-items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Creating Show...' : 'Schedule Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEditShowPage;
