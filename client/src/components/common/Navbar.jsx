import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import notificationService from '../../services/notificationService';
import {
  Film,
  Search,
  MapPin,
  Bell,
  User as UserIcon,
  LogOut,
  Ticket,
  Shield,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await notificationService.getNotifications();
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
          // ignore
        }
      };
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsNavOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date() }))
      );
    } catch (err) {
      // ignore
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-cinematic-secondary border-bottom border-secondary sticky-top py-2">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-4">
          <div
            className="d-flex align-items-center justify-content-center bg-danger text-white rounded-3 p-2 shadow-sm"
            style={{ width: '38px', height: '38px' }}
          >
            <Film size={22} />
          </div>
          <span className="brand-font fw-bold fs-4 text-light tracking-wide">
            I<span className="text-danger">MOVIES</span>
          </span>
        </Link>

        {/* City Selector Pill */}
        <button
          className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1 me-3 px-3 py-1"
          onClick={() => setIsCityModalOpen(true)}
          title="Change location"
        >
          <MapPin size={15} className="text-danger" />
          <span className="small fw-semibold">{selectedCity}</span>
          <ChevronDown size={14} className="text-muted" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="d-none d-md-flex position-relative me-auto" style={{ width: '280px' }}>
          <input
            type="text"
            className="form-control form-control-sm bg-dark text-light border-secondary pe-5 rounded-pill"
            placeholder="Search movies, genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-sm position-absolute end-0 top-50 translate-middle-y text-muted border-0 me-1"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler text-light border-0"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          {isNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links & User Actions */}
        <div className={`collapse navbar-collapse ${isNavOpen ? 'show mt-3' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3">
            <li className="nav-item">
              <Link to="/movies" className="nav-link text-light px-2" onClick={() => setIsNavOpen(false)}>
                Movies
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/theatres" className="nav-link text-light px-2" onClick={() => setIsNavOpen(false)}>
                Theatres
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link text-light px-2" onClick={() => setIsNavOpen(false)}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link text-light px-2" onClick={() => setIsNavOpen(false)}>
                Contact
              </Link>
            </li>

            {/* Notifications Menu */}
            {isAuthenticated && (
              <li className="nav-item dropdown position-relative">
                <button
                  className="btn btn-link text-light p-1 position-relative border-0"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="dropdown-menu dropdown-menu-end show bg-cinematic-card border-secondary text-light p-2 shadow-lg"
                    style={{ width: '320px', position: 'absolute', right: 0 }}
                  >
                    <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary px-2">
                      <span className="fw-bold small">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-sm btn-link text-danger p-0 text-decoration-none small"
                          onClick={handleMarkAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p className="text-muted small text-center my-3">No notifications</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`p-2 rounded mb-1 small ${
                              n.readAt ? 'text-muted' : 'bg-dark text-light border-start border-danger border-2'
                            }`}
                          >
                            <div className="fw-semibold">{n.title}</div>
                            <div className="text-secondary small">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pt-2 text-center border-top border-secondary mt-2">
                      <Link
                        to="/notifications"
                        className="text-danger small text-decoration-none fw-semibold"
                        onClick={() => {
                          setShowNotifications(false);
                          setIsNavOpen(false);
                        }}
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* User Profile or Auth Buttons */}
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-2 px-3 py-1"
                    onClick={() => setIsNavOpen(false)}
                  >
                    <UserIcon size={16} />
                    <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-2 py-1"
                      title="Admin Panel"
                      onClick={() => setIsNavOpen(false)}
                    >
                      <Shield size={15} />
                      <span className="d-none d-lg-inline small">Admin</span>
                    </Link>
                  )}

                  <button
                    className="btn btn-sm text-secondary p-1"
                    onClick={logout}
                    title="Log out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </li>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                <Link
                  to="/login"
                  className="btn btn-sm btn-cinema-outline px-3"
                  onClick={() => setIsNavOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-cinema-red px-3"
                  onClick={() => setIsNavOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
