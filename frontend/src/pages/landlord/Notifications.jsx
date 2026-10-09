import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fade-in">
        <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
        <div className="mt-8 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-lease-200 border-t-lease-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
        <div className="mt-6 rounded-2xl bg-bad-50 p-6 border border-bad-200">
          <p className="text-bad-700">{error}</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink flex items-center gap-3">
            <Bell className="w-6 h-6 text-lease-600" />
            Notifications
          </h1>
          <p className="text-text-muted mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-lease-600 bg-lease-50 rounded-xl hover:bg-lease-100 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-paper rounded-2xl border border-border">
            <Bell className="mx-auto h-12 w-12 text-border mb-4" />
            <h3 className="text-lg font-medium text-ink">No notifications</h3>
            <p className="text-text-muted mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                !notif.isRead
                  ? 'bg-white border-lease-200 shadow-sm'
                  : 'bg-paper/50 border-border opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-lease-600" />
                    )}
                    <h4 className={`font-medium ${!notif.isRead ? 'text-ink' : 'text-text-muted'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-text-muted/60 bg-paper px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {notif.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-2 ${!notif.isRead ? 'text-ink/90' : 'text-text-muted'}`}>
                    {notif.message}
                  </p>
                  
                  <p className="text-xs text-text-muted/60 mt-3 flex items-center gap-1.5">
                    {formatTime(notif.createdAt)}
                  </p>
                </div>
                
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="flex-shrink-0 p-2 text-text-muted hover:text-lease-600 hover:bg-lease-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;