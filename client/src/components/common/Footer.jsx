import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, HelpCircle, PhoneCall, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cinematic-secondary border-top border-secondary mt-5 pt-5 pb-4">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand info */}
          <div className="col-12 col-md-4">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <div
                className="d-flex align-items-center justify-content-center bg-danger text-white rounded-3 p-2"
                style={{ width: '36px', height: '36px' }}
              >
                <Film size={20} />
              </div>
              <span className="brand-font fw-bold fs-4 text-light">
                I<span className="text-danger">MOVIES</span>
              </span>
            </Link>
            <p className="text-secondary small pe-md-4">
              Your premier gateway to extraordinary cinematic experiences. Book IMAX, Dolby Cinema, and 4DX tickets with real-time seat availability and instant confirmation.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <span className="badge bg-dark border border-secondary text-light">24/7 Support</span>
              <span className="badge bg-dark border border-secondary text-light">Instant E-Tickets</span>
              <span className="badge bg-dark border border-secondary text-light">100% Secure Checkout</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h6 className="text-light fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/movies" className="text-secondary text-decoration-none">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-secondary text-decoration-none">Coming Soon</Link></li>
              <li><Link to="/theatres" className="text-secondary text-decoration-none">Cinemas & Theatres</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none">About Us</Link></li>
              <li><Link to="/admin/login" className="text-secondary text-decoration-none">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="col-6 col-md-3">
            <h6 className="text-light fw-bold mb-3">Customer Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/contact" className="text-secondary text-decoration-none">Help Center & FAQ</Link></li>
              <li><Link to="/terms" className="text-secondary text-decoration-none">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none">Cancellation & Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-12 col-md-3">
            <h6 className="text-light fw-bold mb-3">Get in Touch</h6>
            <div className="d-flex flex-column gap-2 small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-danger" />
                <span>support@imovies.com</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <PhoneCall size={16} className="text-danger" />
                <span>+1 (800) 555-IMOV</span>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <ShieldCheck size={16} className="text-success" />
                <span>Verified Cinema Partner</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary pt-4 text-center text-secondary small d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>
            © {new Date().getFullYear()} IMovies Cinema Management & Ticketing System. All rights reserved.
          </div>
          <div className="text-muted">
            Crafted for premium cinema lovers worldwide.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
