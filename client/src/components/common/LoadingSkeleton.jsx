import React from 'react';

export const MovieCardSkeleton = () => (
  <div className="card bg-cinematic-card border-secondary h-100 placeholder-glow">
    <div
      className="placeholder bg-secondary w-100"
      style={{ aspectRatio: '2 / 3', borderRadius: '8px 8px 0 0' }}
    ></div>
    <div className="card-body p-3">
      <div className="placeholder bg-secondary col-8 mb-2 py-2 rounded"></div>
      <div className="placeholder bg-secondary col-5 mb-3 py-1 rounded"></div>
      <div className="placeholder bg-secondary col-12 py-3 rounded"></div>
    </div>
  </div>
);

export const ShowSkeleton = () => (
  <div className="p-3 bg-cinematic-card border-secondary rounded mb-3 placeholder-glow">
    <div className="placeholder bg-secondary col-4 py-2 mb-2 rounded"></div>
    <div className="d-flex gap-2">
      <div className="placeholder bg-secondary col-2 py-3 rounded"></div>
      <div className="placeholder bg-secondary col-2 py-3 rounded"></div>
      <div className="placeholder bg-secondary col-2 py-3 rounded"></div>
    </div>
  </div>
);

export default MovieCardSkeleton;
