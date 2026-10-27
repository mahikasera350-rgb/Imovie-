import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Building2,
  Calendar,
  Ticket,
  Users,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/movies', label: 'Manage Movies', icon: Clapperboard },
    { to: '/admin/theatres', label: 'Manage Theatres', icon: Building2 },
    { to: '/admin/shows', label: 'Manage Shows', icon: Calendar },
    { to: '/admin/bookings', label: 'Manage Bookings', icon: Ticket },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <div className="d-flex min-vh-100 bg-cinematic text-light">
      {/* Sidebar */}
      <aside
        className="d-flex flex-column justify-content-between p-3 bg-cinematic-secondary border-end border-secondary"
        style={{ width: '260px', minHeight: '100vh', position: 'sticky', top: 0 }}
      >
        <div>
          {/* Brand */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4 px-2">
            <div className="bg-danger text-white rounded p-1.5 d-flex align-items-center justify-content-center">
              <Film size={20} />
            </div>
            <span className="brand-font fw-bold fs-5 text-light">
              I<span className="text-danger">MOVIES</span> <span className="badge bg-warning text-dark ms-1 small">Admin</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <ul className="nav flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 transition-all ${
                        isActive
                          ? 'bg-danger text-white fw-bold shadow-sm'
                          : 'text-secondary hover-text-light'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User profile & exit */}
        <div className="pt-3 border-top border-secondary">
          <div className="d-flex align-items-center gap-2 mb-3 px-2">
            <div
              className="rounded-circle bg-dark border border-danger d-flex align-items-center justify-content-center text-danger fw-bold"
              style={{ width: '36px', height: '36px' }}
            >
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="small text-truncate">
              <div className="fw-semibold text-light text-truncate">{user?.name}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link
              to="/"
              className="btn btn-sm btn-cinema-outline flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            >
              <ArrowLeft size={14} />
              <span>Public Site</span>
            </Link>
            <button
              onClick={logout}
              className="btn btn-sm text-secondary"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-x-hidden">
        <header className="p-3 border-bottom border-secondary bg-cinematic-secondary d-flex align-items-center justify-content-between">
          <div className="small text-secondary">
            Cinema Management Portal • Production Ready
          </div>
          <span className="badge bg-success-subtle text-success border border-success px-2 py-1 small">
            Live Database
          </span>
        </header>

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        theme="dark"
      />
    </div>
  );
};

export default AdminLayout;
