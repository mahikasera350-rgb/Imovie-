import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Users, Search, Shield, UserCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search, limit: 50 });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    setUpdatingId(user._id);

    try {
      await adminService.updateUserRole(user._id, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Users className="text-danger" size={26} />
            Manage Users & Roles
          </h2>
          <p className="text-secondary small mb-0">Manage registered customers and assign administrator permissions</p>
        </div>
      </div>

      <div className="mb-4 position-relative" style={{ maxWidth: '360px' }}>
        <input
          type="text"
          className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={16} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading users...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded border border-secondary">
          <p className="text-secondary small mb-0">No users found.</p>
        </div>
      ) : (
        <div className="card bg-cinematic-card border-secondary text-light shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover table-borderless align-middle small mb-0">
              <thead className="border-bottom border-secondary text-secondary">
                <tr>
                  <th>User Details</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th className="text-end">Role Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong className="text-light d-block">{u.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{u.email}</span>
                    </td>
                    <td>{u.city || 'New York'}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin' ? 'bg-warning text-dark fw-bold' : 'bg-secondary'
                        }`}
                      >
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${
                          u.role === 'admin' ? 'btn-outline-warning' : 'btn-cinema-outline'
                        } py-1 px-3`}
                        disabled={updatingId === u._id}
                        onClick={() => handleToggleRole(u)}
                      >
                        {u.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
