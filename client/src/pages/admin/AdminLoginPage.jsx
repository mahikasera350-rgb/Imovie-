import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

const AdminLoginPage = () => {
  const { login, user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already authenticated as administrator
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      // Verify that this user is legitimately an administrator
      if (loggedUser.role !== 'admin') {
        await logout();
        setError(
          `Access Denied: Account (${email}) does not have administrative privileges. Only authorized administrators can access this portal.`
        );
        return;
      }

      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@123456');
    setError('');
  };

  return (
    <div
      className="container py-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: '85vh' }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="card bg-cinematic-card border-secondary text-light shadow-lg">
          <div className="card-body p-4 p-sm-5">
            {/* Admin Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-2 border border-warning shadow-sm"
              >
                <Shield size={32} />
              </div>
              <h3 className="fw-bold text-light mb-1">Admin Portal</h3>
              <div className="badge bg-warning text-dark text-uppercase tracking-wider px-2.5 py-1 mb-2">
                Authorized Access Only
              </div>
              <p className="text-secondary small">
                Secure management access for cinema managers and system administrators
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2.5 px-3 small mb-4 d-flex align-items-start gap-2" role="alert">
                <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-secondary fw-semibold">
                  Administrator Email
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    required
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="admin@imovies.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={18}
                    className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"
                  />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">
                  Admin Master Password
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    required
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock
                    size={18}
                    className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-warning w-100 py-2.5 fw-bold mt-2 shadow-sm d-flex align-items-center justify-content-center gap-2 text-dark"
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <ArrowRight size={18} />
                )}
                Access Admin Dashboard
              </button>
            </form>

            {/* Quick Demo Fill Button */}
            <div className="mt-4 pt-3 border-top border-secondary text-center">
              <button
                type="button"
                className="btn btn-sm btn-cinema-outline w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                onClick={fillAdminCredentials}
              >
                <Shield size={14} className="text-warning" />
                Fill Initial Admin Account (`admin@imovies.com`)
              </button>
            </div>

            {/* Return Link */}
            <div className="text-center mt-4">
              <Link
                to="/"
                className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-1 hover-text-light"
              >
                <ArrowLeft size={14} /> Back to Customer Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
