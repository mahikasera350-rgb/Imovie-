import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Mail, Lock, LogIn, ShieldAlert, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Demo Credentials Helper
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="card bg-cinematic-card border-secondary text-light shadow-lg">
          <div className="card-body p-4 p-sm-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex p-2.5 rounded-3 bg-danger text-white mb-2 shadow-sm"
              >
                <Film size={24} />
              </div>
              <h3 className="fw-bold text-light mb-1">Welcome Back</h3>
              <p className="text-secondary small">
                Sign in to manage bookings, hold seats, and view your digital tickets
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-4" role="alert">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-secondary fw-semibold">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    required
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">Password</label>
                <div className="position-relative">
                  <input
                    type="password"
                    required
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-cinema-red w-100 py-2.5 fw-bold mt-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <LogIn size={18} />
                )}
                Sign In to IMovies
              </button>
            </form>

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="mt-4 pt-3 border-top border-secondary">
              <div className="text-secondary small mb-2 text-center fw-medium">
                ⚡ Quick Fill Test Accounts:
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-cinema-outline flex-grow-1 small py-1.5"
                  onClick={() => fillCredentials('user@imovies.com', 'User@123456')}
                >
                  <UserCheck size={14} className="me-1 text-primary" />
                  Customer
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-cinema-outline flex-grow-1 small py-1.5"
                  onClick={() => fillCredentials('admin@imovies.com', 'Admin@123456')}
                >
                  <ShieldAlert size={14} className="me-1 text-warning" />
                  Admin
                </button>
              </div>
            </div>

            {/* Footer link */}
            <div className="text-center mt-4 small text-secondary">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
