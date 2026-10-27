import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import movieService from '../services/movieService';
import showService from '../services/showService';
import { useCity } from '../context/CityContext';
import { formatDuration, formatDate, formatTime } from '../utils/formatters';
import MovieCard from '../components/movie/MovieCard';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Film,
  Play,
  Share2,
  Ticket,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);

  // Date selection pills
  const today = new Date();
  const dates = [0, 1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].iso);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const res = await movieService.getMovieById(id);
        setMovie(res.data.movie);
        setRelatedMovies(res.data.relatedMovies || []);
      } catch (err) {
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    const fetchShowsForMovie = async () => {
      if (!id) return;
      setShowsLoading(true);
      try {
        const res = await showService.getShows({
          movieId: id,
          date: selectedDate,
          city: selectedCity,
        });
        setShows(res.data.shows || []);
      } catch (err) {
        console.error('Error loading shows:', err);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShowsForMovie();
  }, [id, selectedDate, selectedCity]);

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id;
    if (!theatreId) return acc;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatreId,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3>Movie not found</h3>
        <Link to="/movies" className="btn btn-cinema-red mt-3">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Hero Backdrop */}
      <div
        className="position-relative text-white py-5"
        style={{
          minHeight: '440px',
          backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.96) 25%, rgba(7, 9, 14, 0.8) 60%, rgba(7, 9, 14, 0.5) 100%), url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="container position-relative z-1 py-4">
          <div className="row g-4 align-items-center">
            {/* Poster Card */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-3 shadow-lg border border-secondary"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>

            {/* Movie Info */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-uppercase px-2.5 py-1">
                  {movie.status === 'coming_soon' ? 'Coming Soon' : 'Now Showing'}
                </span>
                {movie.certification && (
                  <span className="badge bg-dark border border-secondary text-light px-2.5 py-1">
                    {movie.certification}
                  </span>
                )}
                <span className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-2.5 py-1">
                  <Star size={13} fill="#f59e0b" />
                  {movie.rating ? `${movie.rating.toFixed(1)} / 10` : 'Unrated'}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-light mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3">
                <span className="text-light fw-medium">{movie.genres?.join(', ')}</span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Clock size={14} />
                  {formatDuration(movie.duration)}
                </span>
                <span>•</span>
                <span>Languages: {movie.languages?.join(', ')}</span>
                <span>•</span>
                <span>Released: {formatDate(movie.releaseDate)}</span>
              </div>

              <p className="lead text-light text-opacity-80 mb-4" style={{ maxWidth: '750px' }}>
                {movie.description}
              </p>

              {/* Cast & Director */}
              <div className="row g-3 small text-secondary mb-4" style={{ maxWidth: '700px' }}>
                <div className="col-12 col-sm-6">
                  <strong className="text-light d-block mb-1">Director:</strong>
                  <span>{movie.director}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <strong className="text-light d-block mb-1">Starring Cast:</strong>
                  <span>{movie.cast?.join(', ') || 'Ensemble Cast'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container py-5">
        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom border-secondary">
            <div>
              <h3 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
                <Ticket className="text-danger" size={24} />
                Select Showtime in {selectedCity}
              </h3>
              <p className="text-secondary small mb-0">
                Choose a cinema, time slot, and screen experience to book your seats
              </p>
            </div>

            {/* Date Selection Pills */}
            <div className="d-flex gap-2 overflow-x-auto pb-2 pb-md-0">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  className={`btn btn-sm d-flex flex-column align-items-center px-3 py-2 rounded-3 text-nowrap ${
                    selectedDate === d.iso ? 'btn-cinema-red' : 'btn-cinema-outline'
                  }`}
                  onClick={() => setSelectedDate(d.iso)}
                >
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{d.dayName}</span>
                  <span className="small opacity-75">{d.dateFormatted}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theatres & Shows List */}
        {showsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading showtimes...</span>
            </div>
          </div>
        ) : Object.keys(showsByTheatre).length === 0 ? (
          <div className="text-center py-5 bg-cinematic-card rounded border border-secondary mb-5">
            <Calendar size={44} className="text-secondary mb-2" />
            <h5 className="text-light">No shows scheduled on this date in {selectedCity}</h5>
            <p className="text-secondary small mb-3">
              Please choose another date or change your city to explore available screens.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4 mb-5">
            {Object.values(showsByTheatre).map(({ theatre, shows }) => (
              <div
                key={theatre._id}
                className="p-4 rounded-3 bg-cinematic-card border border-secondary"
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary">
                  <div>
                    <h5 className="fw-bold text-light mb-1">{theatre.name}</h5>
                    <div className="small text-muted d-flex align-items-center gap-2">
                      <MapPin size={14} className="text-danger" />
                      <span>{theatre.address}, {theatre.city}</span>
                    </div>
                  </div>

                  {theatre.facilities && (
                    <div className="d-flex flex-wrap gap-1">
                      {theatre.facilities.slice(0, 3).map((fac) => (
                        <span key={fac} className="badge bg-dark border border-secondary text-secondary small">
                          {fac}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Showtimes for this theatre */}
                <div className="d-flex flex-wrap gap-3">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      className="btn btn-cinema-outline text-start p-2.5 rounded-3 d-flex flex-column gap-1 transition-all"
                      style={{ minWidth: '130px' }}
                      onClick={() => navigate(`/seats/${show._id}`)}
                    >
                      <div className="fw-bold text-light fs-6">
                        {formatTime(show.startTime)}
                      </div>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <span className="badge bg-danger-subtle text-danger border border-danger small" style={{ fontSize: '0.68rem' }}>
                          {show.format || 'Standard'}
                        </span>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {show.screenName || `Audi ${show.screenNumber}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Recommendations */}
        {relatedMovies.length > 0 && (
          <div className="pt-4 border-top border-secondary">
            <h4 className="fw-bold text-light mb-4">You Might Also Like</h4>
            <div className="row row-cols-2 row-cols-md-4 g-4">
              {relatedMovies.slice(0, 4).map((rel) => (
                <div key={rel._id} className="col">
                  <MovieCard movie={rel} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
