import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, Save, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'New York',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileData);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setChangingPass(true);
    try {
      await changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <User className="text-danger" size={26} />
          Account & Profile Settings
        </h2>
        <p className="text-secondary small mb-5">
          Manage your personal details, preferred cinema location, and account security
        </p>

        <div className="row g-4">
          {/* Edit Profile Column */}
          <div className="col-12 col-md-6">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100">
              <h5 className="fw-bold text-light mb-3 pb-2 border-bottom border-secondary">
                Personal Information
              </h5>

              <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small text-secondary fw-semibold">Email Address (Read-only)</label>
                  <div className="position-relative">
                    <input
                      type="email"
                      disabled
                      className="form-control bg-black border-secondary text-secondary ps-5 py-2"
                      value={user?.email || ''}
                    />
                    <Mail size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary fw-semibold">Full Name</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      required
                      className="form-control bg-dark border-secondary text-light ps-5 py-2"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                    <User size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary fw-semibold">Phone Number</label>
                  <div className="position-relative">
                    <input
                      type="tel"
                      className="form-control bg-dark border-secondary text-light ps-5 py-2"
                      placeholder="+1 555-0199"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                    <Phone size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary fw-semibold">Default City</label>
                  <div className="position-relative">
                    <select
                      className="form-select bg-dark border-secondary text-light ps-5 py-2"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
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
                    <MapPin size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-cinema-red mt-2 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Save size={16} />
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password Column */}
          <div className="col-12 col-md-6">
            <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100">
              <h5 className="fw-bold text-light mb-3 pb-2 border-bottom border-secondary">
                Security & Password
              </h5>

              <form onSubmit={handlePasswordSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small text-secondary fw-semibold">Current Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      required
                      className="form-control bg-dark border-secondary text-light ps-5 py-2"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <Lock size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary fw-semibold">New Password (min 8 chars)</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      required
                      className="form-control bg-dark border-secondary text-light ps-5 py-2"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <KeyRound size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <div>
                  <label className="form-label small text-secondary fw-semibold">Confirm New Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      required
                      className="form-control bg-dark border-secondary text-light ps-5 py-2"
                      placeholder="••••••••"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                    />
                    <KeyRound size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="btn btn-cinema-outline mt-2 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Lock size={16} />
                  {changingPass ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
