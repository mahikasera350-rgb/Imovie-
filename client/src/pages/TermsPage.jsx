import React from 'react';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-5">
          <FileText size={36} className="text-danger mb-2" />
          <h1 className="fw-extrabold text-light mb-1">Terms of Service</h1>
          <p className="text-secondary small">Last updated: October 2026</p>
        </div>

        <div className="p-4 p-md-5 rounded-4 bg-cinematic-card border border-secondary text-secondary small d-flex flex-column gap-3 leading-relaxed">
          <h5 className="text-light fw-bold">1. Agreement to Terms</h5>
          <p>
            By accessing or using IMovies, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our services.
          </p>

          <h5 className="text-light fw-bold">2. Seat Reservations & Temporary Holds</h5>
          <p>
            Seats selected by a user remain in a temporary hold state for a maximum of 5 minutes to complete payment. If payment verification is not completed within this hold duration, seats are released back to public availability automatically.
          </p>

          <h5 className="text-light fw-bold">3. Cancellation & Refund Policy</h5>
          <p>
            Bookings may be cancelled via the user dashboard at any point before the scheduled show start time. Once cancelled, seats are returned to inventory and the full refundable amount is tracked under your account. Bookings for shows that have already commenced cannot be cancelled or refunded.
          </p>

          <h5 className="text-light fw-bold">4. Prohibited Uses</h5>
          <p>
            Users are strictly prohibited from using automated bots, scrapers, or scripts to place fraudulent holds or circumvent booking rate limits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
