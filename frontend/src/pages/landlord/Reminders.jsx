import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Search,
  Filter,
  X,
} from 'lucide-react';

import api from '../../services/api';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(
        '/rent-reminders/my-reminders'
      );

      const data =
        response.data?.reminders ||
        response.data ||
        [];

      setReminders(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        'Failed to load landlord reminders:',
        err.response?.status,
        err.response?.data || err.message
      );

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

  const getReminderTitle = (reminder) => {
    return (
      reminder.title ||
      reminder.reminderTitle ||
      reminder.name ||
      'Reminder'
    );
  };

  const getPropertyName = (reminder) => {
    if (typeof reminder.property === 'string') {
      return reminder.property;
    }

    return (
      reminder.property?.title ||
      reminder.propertyName ||
      'Property'
    );
  };

  const getReminderType = (reminder) => {
    return (
      reminder.type ||
      reminder.reminderType ||
      'Reminder'
    );
  };

  const getReminderDate = (reminder) => {
    const date =
      reminder.dueDate ||
      reminder.reminderDate ||
      reminder.date;

    if (!date) {
      return 'Date not specified';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getReminderStatus = (reminder) => {
    return (
      reminder.status ||
      'upcoming'
    ).toLowerCase();
  };

  const getTypeClasses = (type) => {
    const normalizedType =
      type.toLowerCase();

    if (
      normalizedType.includes('rent')
    ) {
      return 'bg-warn-50 text-warn-600';
    }

    if (
      normalizedType.includes('agreement')
    ) {
      return 'bg-lease-50 text-lease-600';
    }

    if (
      normalizedType.includes('maintenance')
    ) {
      return 'bg-signal-50 text-signal-600';
    }

    return 'bg-paper text-text-muted';
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-good-50 text-good-700';

      case 'overdue':
        return 'bg-risk-red-bg text-risk-red';

      case 'cancelled':
        return 'bg-paper text-text-faint';

      case 'due':
        return 'bg-warn-50 text-warn-600';

      default:
        return 'bg-lease-50 text-lease-600';
    }
  };

  const handleComplete = async (reminder) => {
    if (!reminder._id) {
      setError(
        'This reminder does not have a valid ID.'
      );
      return;
    }

    const confirmed = window.confirm(
      `Mark "${getReminderTitle(reminder)}" as completed?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      /*
       * The current reminder backend uses the pay endpoint
       * for completing rent reminders.
       */
      await api.put(
        `/rent-reminders/${reminder._id}/pay`
      );

      await fetchReminders();
    } catch (err) {
      console.error(
        'Failed to complete reminder:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to complete reminder.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const filteredData = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return reminders.filter((reminder) => {
      const title =
        getReminderTitle(reminder)
          .toLowerCase();

      const property =
        getPropertyName(reminder)
          .toLowerCase();

      const type =
        getReminderType(reminder)
          .toLowerCase();

      const status =
        getReminderStatus(reminder);

      const matchesSearch =
        !search ||
        title.includes(search) ||
        property.includes(search) ||
        type.includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    reminders,
    searchTerm,
    statusFilter,
  ]);

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Reminders
          </h1>

          <p className="text-text-muted mt-1">
            Manage important dates, deadlines, and property maintenance.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters
                  ? 'bg-lease-50 border-lease-500 text-lease-600'
                  : 'bg-paper border-border text-ink hover:bg-border/50'
                }`}
            >
              <Filter className="w-4 h-4" />

              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b border-border bg-paper/30">

            <div className="flex flex-col sm:flex-row gap-4">

              {/* Status */}
              <div className="w-full sm:w-64">
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500"
                >
                  <option value="all">
                    All Statuses
                  </option>

                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="due">
                    Due
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-ink hover:bg-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

            <p className="text-text-muted">
              Loading reminders...
            </p>
          </div>
        ) : filteredData.length > 0 ? (

          /* Reminder List */
          <div className="divide-y divide-border">
            {filteredData.map((reminder) => {
              const title =
                getReminderTitle(reminder);

              const property =
                getPropertyName(reminder);

              const type =
                getReminderType(reminder);

              const date =
                getReminderDate(reminder);

              const status =
                getReminderStatus(reminder);

              const isCompleted =
                status === 'completed' ||
                status === 'paid';

              return (
                <div
                  key={reminder._id}
                  className="p-6 hover:bg-paper/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >

                  {/* Reminder Info */}
                  <div className="flex items-start gap-4">

                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${getTypeClasses(type)}`}
                    >
                      <Bell className="w-6 h-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg text-ink">
                        {title}
                      </h3>

                      <p className="text-sm text-text-muted mt-1 truncate">
                        {property}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2">

                        {/* Type */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-paper border border-border text-text-muted">
                          {type}
                        </span>

                        {/* Date */}
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${status === 'overdue'
                              ? 'text-risk-red'
                              : status === 'completed' ||
                                status === 'paid'
                                ? 'text-good-700'
                                : 'text-warn-600'
                            }`}
                        >
                          <Clock className="w-4 h-4" />

                          Due: {date}
                        </span>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getStatusClasses(status)}`}
                        >
                          {status}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 sm:pl-16">

                    {!isCompleted &&
                      status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleComplete(
                              reminder
                            )
                          }
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-good-50 text-good-700 border border-good-500/20 rounded-lg text-sm font-medium hover:bg-good-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4" />

                          Complete
                        </button>
                      )}

                    {isCompleted && (
                      <span className="flex items-center gap-2 px-4 py-2 bg-good-50 text-good-700 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />

                        Completed
                      </span>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* Empty State */
          <div className="p-12 text-center">

            <Bell className="w-12 h-12 text-text-faint mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-ink">
              No reminders found
            </h3>

            <p className="text-text-muted mt-1">
              There are no reminders matching your current search or filters.
            </p>

            {(searchTerm ||
              statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-lease-600 font-medium hover:bg-lease-50 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}

          </div>
        )}
      </div>

      {/* Action Loading */}
      {actionLoading && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          Updating reminder...
        </div>
      )}
    </div>
  );
};

export default Reminders;