import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [prefs, setPrefs] = useState([
    {
      id: 1,
      label: 'Email Notifications',
      desc: 'Get updates about your account by email',
      on: true,
    },
    {
      id: 2,
      label: 'Rental Request Notifications',
      desc: 'Know when a landlord responds to your request',
      on: true,
    },
    {
      id: 3,
      label: 'Agreement Reminders',
      desc: 'Reminders for rent, notice periods, and renewals',
      on: true,
    },
    {
      id: 4,
      label: 'AI Analysis Notifications',
      desc: 'Get notified when an analysis finishes processing',
      on: false,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required.');
      setMessage('');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required.');
      setMessage('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      await api.put(`/users/${user._id}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      await refreshUser();

      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error('Profile update error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (id) => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            on: !p.on,
          }
          : p
      )
    );
  };

  const getInitials = () => {
    const name = formData.name || user?.name || 'User';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="rounded-xl2 border border-border bg-white p-8 text-center">
          <p className="text-sm text-text-muted">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Profile & settings
      </h1>

      <p className="mt-1 text-sm text-text-muted">
        Manage your account details and preferences.
      </p>

      {message && (
        <div className="mt-4 rounded-lg border border-good-500/20 bg-good-50 px-4 py-3 text-sm text-good-600">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-3 text-sm text-bad-600">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* Personal Information */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">
              Personal information
            </p>

            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-signal-100 font-display text-lg font-semibold text-signal-600">
                {getInitials()}
              </span>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted opacity-60"
                title="Profile photo upload will be connected separately"
              >
                Change photo
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Full name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lease-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lease-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Phone
                </label>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lease-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Role
                </label>

                <input
                  value={user?.role || 'tenant'}
                  disabled
                  className="mt-1.5 w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-sm capitalize text-text-muted focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-5 rounded-lg bg-lease-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-lease-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          {/* Account Security */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">
              Account security
            </p>

            <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  Password
                </p>

                <p className="text-xs text-text-faint">
                  Password management is not available yet.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted opacity-60"
              >
                Change password
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  Login sessions
                </p>

                <p className="text-xs text-text-faint">
                  Session management is not available yet.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted opacity-60"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">
              Notification preferences
            </p>

            <p className="mt-1 text-xs text-text-faint">
              These preferences are currently stored for this session only.
            </p>

            <div className="mt-4 space-y-4">
              {prefs.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {p.label}
                    </p>

                    <p className="text-xs text-text-faint">
                      {p.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePref(p.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${p.on
                        ? 'bg-lease-600'
                        : 'bg-border'
                      }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.on ? 'translate-x-4' : ''
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="h-fit rounded-xl2 border border-border bg-white p-6">
          <p className="font-display text-base font-semibold text-ink">
            Account
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-border px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper"
          >
            Log out
          </button>

          <button
            type="button"
            disabled
            className="mt-3 w-full cursor-not-allowed rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-2.5 text-left text-sm font-medium text-bad-600 opacity-60"
            title="Delete account is not connected yet"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;