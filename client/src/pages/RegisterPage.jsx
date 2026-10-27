import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, Mail, Lock, UserPlus, MapPin } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'Mumbai',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '480px' }}>
        <div className="card bg-cinematic-card border-secondary text-light shadow-lg">
          <div className="card-body p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-2.5 rounded-3 bg-danger text-white mb-2 shadow-sm">
                <Film size={24} />
              </div>
              <h3 className="fw-bold text-light mb-1">Create Account</h3>
              <p className="text-secondary small">
                Join IMovies to book seats, access advance screenings, and earn rewards
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small text-secondary fw-semibold">Full Name</label>
                <div className="position-relative">
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <User size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <Mail size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">Preferred City</label>
                <div className="position-relative">
                  <select
                    name="city"
                    className="form-select bg-dark border-secondary text-light ps-5 py-2.5"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    <option value="Indore">Indore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="San Francisco">San Francisco</option>
                  </select>
                  <MapPin size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">Password (min 8 chars)</label>
                <div className="position-relative">
                  <input
                    type="password"
                    required
                    name="password"
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Lock size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="form-label small text-secondary fw-semibold">Confirm Password</label>
                <div className="position-relative">
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    className="form-control bg-dark border-secondary text-light ps-5 py-2.5"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                  <UserPlus size={18} />
                )}
                Register Account
              </button>
            </form>

            <div className="text-center mt-4 small text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-semibold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
