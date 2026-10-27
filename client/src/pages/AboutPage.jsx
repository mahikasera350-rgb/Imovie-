import React from 'react';
import { Film, Sparkles, Shield, Zap, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '840px' }}>
        <div className="text-center mb-5">
          <div className="d-inline-flex p-3 rounded-circle bg-danger text-white mb-3 shadow">
            <Film size={36} />
          </div>
          <h1 className="fw-extrabold text-light mb-2">About IMovies</h1>
          <p className="lead text-secondary">
            Redefining the modern cinema experience with cutting-edge ticketing, real-time seat reservation, and premium venue curation.
          </p>
        </div>

        <div className="p-4 p-md-5 rounded-4 bg-cinematic-card border border-secondary mb-5">
          <h3 className="fw-bold text-light mb-3">Our Mission</h3>
          <p className="text-secondary leading-relaxed">
            At IMovies, we believe watching a movie isn't just entertainment—it's an immersive artistic ritual. We created IMovies to eliminate long theatre lines, double bookings, and confusing reservation systems. Our platform connects moviegoers with top-tier cinemas featuring IMAX Laser, Dolby Atmos, and luxury recliners with real-time seat hold synchronization and guaranteed ticket issuance.
          </p>

          <div className="row g-4 mt-3">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-danger fw-bold">
                <Zap size={20} /> Real-Time Sync
              </div>
              <p className="small text-secondary">
                Live Socket.IO seat holds prevent two customers from confirming the same seat simultaneously.
              </p>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-warning fw-bold">
                <Sparkles size={20} /> Premium Formats
              </div>
              <p className="small text-secondary">
                Discover screenings in IMAX 3D, Dolby Cinema, 4DX motion seats, and VIP dine-in auditoriums.
              </p>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                <Shield size={20} /> Guaranteed Refund
              </div>
              <p className="small text-secondary">
                Transparent cancellation policy with automated seat release and instant digital refund tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-4 border-top border-secondary">
          <div className="small text-secondary">
            IMovies Cinema Architecture • Engineered with MERN Stack, Socket.IO & Enterprise Security
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
