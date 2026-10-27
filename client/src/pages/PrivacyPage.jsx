import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-5">
          <Shield size={36} className="text-danger mb-2" />
          <h1 className="fw-extrabold text-light mb-1">Privacy Policy</h1>
          <p className="text-secondary small">Last updated: October 2026</p>
        </div>

        <div className="p-4 p-md-5 rounded-4 bg-cinematic-card border border-secondary text-secondary small d-flex flex-column gap-3 leading-relaxed">
          <h5 className="text-light fw-bold">1. Information We Collect</h5>
          <p>
            When you register, book tickets, or interact with IMovies, we collect essential account details including your full name, email address, phone number, and preferred cinema city. We store passwords strictly as hashed strings using bcrypt. We never store credit card numbers, CVVs, or payment passwords.
          </p>

          <h5 className="text-light fw-bold">2. Use of Cookies and Session Security</h5>
          <p>
            We use secure HttpOnly cookies with SameSite attributes to keep you authenticated safely without risk of cross-site scripting (XSS) credential theft. Session tokens expire automatically and are strictly validated on every sensitive request.
          </p>

          <h5 className="text-light fw-bold">3. Real-Time Seat Synchronization</h5>
          <p>
            To provide live seat selection through Socket.IO, temporary hold tokens are stored in the database to associate held seats with your booking session for up to 5 minutes, after which unconfirmed seats are automatically released.
          </p>

          <h5 className="text-light fw-bold">4. Contact & Inquiries</h5>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data deletion, contact us at privacy@imovies.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
