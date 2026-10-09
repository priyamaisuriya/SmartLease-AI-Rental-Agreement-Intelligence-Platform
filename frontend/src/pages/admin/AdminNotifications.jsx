import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../../services/api';

const timeAgo = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString();
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((list) => list.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notifications.');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((list) => list.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification.');
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">System Notifications</h1>
          <p className="text-text-muted mt-1">
            Platform-wide alerts and updates{unread > 0 ? ` — ${unread} unread` : ''}.
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="flex items-center gap-2 text-sm font-medium text-lease-600 hover:text-lease-700 disabled:opacity-40"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {error && <div className="p-3 text-sm rounded-lg text-risk-red bg-risk-red-bg">{error}</div>}

      <div className="bg-white border border-border rounded-xl shadow-sm divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-text-muted">You have no notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-6 flex items-start gap-4 transition-colors ${!n.isRead ? 'bg-lease-50/30' : 'hover:bg-paper/50'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !n.isRead ? 'bg-lease-100 text-lease-600' : 'bg-paper text-text-muted border border-border'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-ink' : 'text-ink'}`}>{n.title}</p>
                {n.message && <p className="text-sm text-text-muted mt-0.5">{n.message}</p>}
                <p className="text-xs text-text-muted mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markRead(n._id)}
                  className="p-2 text-text-faint hover:text-lease-600 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => remove(n._id)}
                className="p-2 text-text-faint hover:text-risk-red transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
