import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const MovieCard = ({ movie }) => {
  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="movie-card h-100 d-flex flex-column text-light">
      <Link to={`/movies/${movie._id}`} className="position-relative text-decoration-none">
        <img
          src={movie.posterUrl || fallbackPoster}
          alt={movie.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackPoster;
          }}
          loading="lazy"
        />

        {/* Rating badge */}
        {movie.rating && (
          <div
            className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded bg-black bg-opacity-75 d-flex align-items-center gap-1 shadow-sm"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <Star size={13} className="text-warning fill-warning" fill="#f59e0b" />
            <span className="small fw-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Certification badge */}
        {movie.certification && (
          <div
            className="position-absolute top-0 end-0 m-2 px-2 py-0.5 rounded bg-danger text-white fw-bold shadow-sm"
            style={{ fontSize: '0.7rem' }}
          >
            {movie.certification}
          </div>
        )}
      </Link>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <Link
            to={`/movies/${movie._id}`}
            className="text-light text-decoration-none"
            title={movie.title}
          >
            <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '1.02rem' }}>
              {movie.title}
            </h6>
          </Link>

          <div className="d-flex align-items-center justify-content-between text-muted small mb-2">
            <span className="text-truncate me-1">{movie.genres?.slice(0, 2).join(', ')}</span>
            {movie.duration && (
              <span className="d-flex align-items-center gap-1 text-nowrap">
                <Clock size={12} />
                {formatDuration(movie.duration)}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/movies/${movie._id}`}
          className={`btn btn-sm w-100 mt-2 ${
            movie.status === 'coming_soon' ? 'btn-cinema-outline' : 'btn-cinema-red'
          }`}
        >
          {movie.status === 'coming_soon' ? 'Explore Details' : 'Book Tickets'}
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
