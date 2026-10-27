import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Clock, X } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const HeroBanner = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  // Convert youtube watch URL to embed if present
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  return (
    <>
      <div
        className="position-relative text-white py-5 mb-5 overflow-hidden"
        style={{
          minHeight: '520px',
          backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.95) 20%, rgba(7, 9, 14, 0.75) 60%, rgba(7, 9, 14, 0.4) 100%), url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="container position-relative z-1 h-100 d-flex flex-column justify-content-center">
          <div className="row align-items-center">
            <div className="col-12 col-lg-7 py-4">
              {/* Badges */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-danger text-uppercase px-2 py-1">Featured Premiere</span>
                {movie.certification && (
                  <span className="badge bg-dark border border-secondary text-light px-2 py-1">
                    {movie.certification}
                  </span>
                )}
                {movie.rating && (
                  <span className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-2 py-1">
                    <Star size={12} fill="#f59e0b" />
                    {movie.rating.toFixed(1)} / 10
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="display-4 fw-extrabold text-light mb-3">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3">
                <span className="text-light">{movie.genres?.join(' • ')}</span>
                <span>|</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Clock size={14} />
                  {formatDuration(movie.duration)}
                </span>
                <span>|</span>
                <span>Languages: {movie.languages?.join(', ')}</span>
              </div>

              {/* Description */}
              <p
                className="lead text-light text-opacity-75 mb-4 line-clamp-3"
                style={{
                  maxWidth: '620px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {movie.description}
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link
                  to={`/movies/${movie._id}`}
                  className="btn btn-cinema-red px-4 py-2 d-flex align-items-center gap-2"
                >
                  <Ticket size={18} />
                  Book Tickets Now
                </Link>

                {movie.trailerUrl && (
                  <button
                    className="btn btn-cinema-outline px-4 py-2 d-flex align-items-center gap-2"
                    onClick={() => setShowTrailer(true)}
                  >
                    <Play size={18} />
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-black border-secondary">
              <div className="modal-header border-secondary p-2">
                <span className="text-light small fw-bold px-2">{movie.title} — Official Trailer</span>
                <button
                  type="button"
                  className="btn text-secondary p-1"
                  onClick={() => setShowTrailer(false)}
                >
                  <X size={22} />
                </button>
              </div>
              <div className="modal-body p-0 ratio ratio-16x9">
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  title={`${movie.title} Trailer`}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroBanner;
