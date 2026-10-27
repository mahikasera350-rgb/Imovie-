import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { formatDate, formatTime } from '../utils/formatters';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: '720px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
          <div>
            <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
              <Bell className="text-danger" size={26} />
              Notifications
            </h2>
            <p className="text-secondary small mb-0">
              Stay updated on booking confirmations, refunds, and premiere announcements
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1.5"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={16} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading notifications...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-5 text-center bg-cinematic-card rounded-3 border border-secondary">
            <Bell size={44} className="text-secondary mb-2" />
            <h5 className="text-light">No notifications</h5>
            <p className="text-secondary small mb-0">You're completely caught up!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2.5">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3.5 rounded-3 border transition-all d-flex justify-content-between align-items-center gap-3 ${
                  n.readAt
                    ? 'bg-cinematic-card border-secondary opacity-75'
                    : 'bg-dark border-danger border-2 shadow-sm'
                }`}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="fw-bold text-light mb-0">{n.title}</h6>
                    {!n.readAt && <span className="badge bg-danger small">NEW</span>}
                  </div>
                  <p className="small text-secondary mb-1">{n.message}</p>
                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                    {formatDate(n.createdAt)} at {formatTime(n.createdAt)}
                  </div>
                </div>

                {!n.readAt && (
                  <button
                    className="btn btn-sm btn-cinema-outline p-1.5"
                    onClick={() => handleMarkAsRead(n._id)}
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
