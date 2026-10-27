import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Clapperboard } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="text-center p-5 rounded-4 bg-cinematic-card border border-secondary shadow-lg" style={{ maxWidth: '520px' }}>
        <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
          <Clapperboard size={48} />
        </div>
        <h1 className="display-4 fw-extrabold text-light mb-1">404</h1>
        <h4 className="fw-bold text-light mb-2">Scene Not Found</h4>
        <p className="text-secondary small mb-4">
          The page or screening reel you are looking for has been cut from the final film or moved to another premiere theatre.
        </p>
        <Link to="/" className="btn btn-cinema-red px-4 py-2.5 d-inline-flex align-items-center gap-2 fw-semibold">
          <Home size={18} />
          Return to Box Office
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
