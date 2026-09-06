import React, { useEffect, useState } from 'react';
import { Calendar, Bell, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const Reminders = () => {
  const [remindersList, setRemindersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/rent-reminders/my-reminders');

      const reminders =
        response.data?.reminders ||
        response.data?.data ||
        [];

      setRemindersList(Array.isArray(reminders) ? reminders : []);
    } catch (err) {
      console.error('Failed to load reminders:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load reminders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const getStatusLabel = (status) => {
    const map = {
      upcoming: 'Upcoming',
      due: 'Due',
      overdue: 'Overdue',
      paid: 'Paid',
      cancelled: 'Cancelled',
    };

    return map[status] || status || 'Unknown';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-good-50 text-good-600';

      case 'overdue':
        return 'bg-bad-50 text-bad-600';

      case 'due':
        return 'bg-warn-50 text-warn-600';

      case 'cancelled':
        return 'bg-ink/5 text-text-muted';

      default:
        return 'bg-lease-50 text-lease-700';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '₹0';
    }

    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getPropertyTitle = (reminder) => {
    if (reminder.property?.title) {
      return reminder.property.title;
    }

    if (typeof reminder.property === 'string') {
      return reminder.property;
    }

    if (reminder.rental?.property?.title) {
      return reminder.rental.property.title;
    }

    return 'Rental property';
  };

  const getReminderType = (reminder) => {
    if (reminder.type) {
      return reminder.type;
    }

    return 'Rent Due';
  };

  const payReminder = async (id) => {
    try {
      setActionLoading(id);
      setError('');

      await api.put(`/rent-reminders/${id}/pay`);

      await fetchReminders();
    } catch (err) {
      console.error('Failed to mark reminder as paid:', err);

      setError(
        err.response?.data?.message ||
        'Failed to mark reminder as paid.'
      );
    } finally {
      setActionLoading('');
    }
  };

  const cancelReminder = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reminder?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError('');

      await api.put(`/rent-reminders/${id}/cancel`);

      await fetchReminders();
    } catch (err) {
      console.error('Failed to cancel reminder:', err);

      setError(
        err.response?.data?.message ||
        'Failed to cancel reminder.'
      );
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="fade-in relative">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Reminders
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Rent, deadlines, and renewals — all in one timeline.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-3 text-sm text-bad-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 rounded-xl2 border border-border bg-white p-10 text-center">
          <p className="text-sm text-text-muted">
            Loading reminders...
          </p>
        </div>
      ) : remindersList.length > 0 ? (

        <div className="mt-6 space-y-4">

          {remindersList.map((r) => {
            const reminderId = r._id || r.id;
            const status = r.status;

            const isPaid = status === 'paid';
            const isCancelled = status === 'cancelled';
            const isProcessing = actionLoading === reminderId;

            return (
              <div
                key={reminderId}
                className="flex flex-col gap-4 rounded-xl2 border border-border bg-white p-5 shadow-soft sm:flex-row sm:items-start"
              >

                {/* Icon */}
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isPaid
                      ? 'bg-good-50 text-good-600'
                      : isCancelled
                        ? 'bg-ink/5 text-text-muted'
                        : 'bg-lease-50 text-lease-600'
                    }`}
                >
                  <Bell size={18} />
                </span>

                {/* Information */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <p className="font-display text-sm font-semibold text-ink">
                      Rent Due
                    </p>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        status
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {getStatusLabel(status)}
                    </span>

                  </div>

                  <p className="mt-1 text-sm font-medium text-ink">
                    {formatCurrency(r.amount)}
                  </p>

                  <p className="mt-1 text-xs text-text-faint">
                    {getReminderType(r)} · Due{' '}
                    {formatDate(r.dueDate)}
                  </p>

                  <p className="mt-1 text-xs text-text-faint">
                    {getPropertyTitle(r)}
                  </p>

                  {r.notes && (
                    <p className="mt-2 text-xs text-text-muted">
                      {r.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!isPaid && !isCancelled && (
                  <div className="flex shrink-0 gap-2 sm:self-center">

                    <button
                      type="button"
                      onClick={() => payReminder(reminderId)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-good-500/20 bg-good-50 px-2.5 py-1.5 text-xs font-medium text-good-600 hover:bg-good-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle size={14} />

                      {isProcessing
                        ? 'Updating...'
                        : 'Mark Paid'}
                    </button>

                    <button
                      type="button"
                      onClick={() => cancelReminder(reminderId)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-bad-500/20 bg-bad-50 px-2.5 py-1.5 text-xs font-medium text-bad-600 hover:bg-bad-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle size={14} />

                      Cancel
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      ) : (

        /* Empty State */
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">

          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
            <Calendar size={20} />
          </span>

          <p className="font-display text-base font-semibold text-ink">
            No reminders yet
          </p>

          <p className="mt-1.5 max-w-sm text-sm text-text-faint">
            You currently have no rent reminders.
          </p>

        </div>
      )}

    </div>
  );
};

export default Reminders;
