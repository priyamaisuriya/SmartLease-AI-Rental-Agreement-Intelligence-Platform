import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react';

import api from '../../services/api';

const READ_NOTIFICATIONS_KEY =
  'smartlease_landlord_read_notifications';

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [readIds, setReadIds] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            READ_NOTIFICATIONS_KEY
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        propertiesResponse,
        rentalsResponse,
        agreementsResponse,
        remindersResponse,
      ] = await Promise.all([
        api.get('/properties/my-properties'),
        api.get('/rentals/my-properties'),
        api.get('/agreements/my-agreements'),
        api.get('/rent-reminders/my-reminders'),
      ]);

      const propertyData =
        propertiesResponse.data?.properties ||
        propertiesResponse.data ||
        [];

      const rentalData =
        rentalsResponse.data?.rentals ||
        rentalsResponse.data ||
        [];

      const agreementData =
        agreementsResponse.data?.agreements ||
        agreementsResponse.data ||
        [];

      const reminderData =
        remindersResponse.data?.reminders ||
        remindersResponse.data ||
        [];

      const properties = Array.isArray(
        propertyData
      )
        ? propertyData
        : [];

      const rentals = Array.isArray(
        rentalData
      )
        ? rentalData
        : [];

      const agreements = Array.isArray(
        agreementData
      )
        ? agreementData
        : [];

      const reminders = Array.isArray(
        reminderData
      )
        ? reminderData
        : [];

      const generated = [];

      /*
       * PROPERTY NOTIFICATIONS
       */
      properties.forEach((property) => {
        if (
          property.status === 'available'
        ) {
          generated.push({
            id: `property-available-${property._id}`,
            title: `"${property.title}" is currently available for rent.`,
            date:
              property.updatedAt ||
              property.createdAt,
          });
        }

        if (
          property.status === 'rented'
        ) {
          generated.push({
            id: `property-rented-${property._id}`,
            title: `"${property.title}" is currently rented.`,
            date:
              property.updatedAt ||
              property.createdAt,
          });
        }
      });

      /*
       * RENTAL NOTIFICATIONS
       */
      rentals.forEach((rental) => {
        const tenantName =
          rental.tenant?.name ||
          rental.tenantName ||
          'A tenant';

        const propertyName =
          rental.property?.title ||
          rental.propertyName ||
          'your property';

        if (
          rental.status === 'active'
        ) {
          generated.push({
            id: `rental-active-${rental._id}`,
            title: `${tenantName} currently has an active rental for "${propertyName}".`,
            date:
              rental.updatedAt ||
              rental.bookingDate ||
              rental.createdAt,
          });
        }

        if (
          rental.status === 'completed'
        ) {
          generated.push({
            id: `rental-completed-${rental._id}`,
            title: `Rental for "${propertyName}" with ${tenantName} has been completed.`,
            date:
              rental.updatedAt ||
              rental.endDate ||
              rental.createdAt,
          });
        }

        if (
          rental.status === 'cancelled'
        ) {
          generated.push({
            id: `rental-cancelled-${rental._id}`,
            title: `Rental for "${propertyName}" was cancelled.`,
            date:
              rental.updatedAt ||
              rental.createdAt,
          });
        }
      });

      /*
       * AGREEMENT NOTIFICATIONS
       */
      agreements.forEach((agreement) => {
        const propertyName =
          agreement.property?.title ||
          'your property';

        generated.push({
          id: `agreement-${agreement._id}`,
          title: `Agreement "${agreement.title || agreement.originalFileName}" is ${agreement.status || 'available'} for "${propertyName}".`,
          date:
            agreement.updatedAt ||
            agreement.uploadedAt ||
            agreement.createdAt,
        });
      });

      /*
       * REMINDER NOTIFICATIONS
       */
      reminders.forEach((reminder) => {
        const title =
          reminder.title ||
          reminder.reminderTitle ||
          reminder.name ||
          'Reminder';

        const status =
          String(
            reminder.status || ''
          ).toLowerCase();

        if (
          status === 'overdue'
        ) {
          generated.push({
            id: `reminder-overdue-${reminder._id}`,
            title: `Reminder "${title}" is overdue.`,
            date:
              reminder.dueDate ||
              reminder.reminderDate ||
              reminder.date,
          });
        } else if (
          status === 'due'
        ) {
          generated.push({
            id: `reminder-due-${reminder._id}`,
            title: `Reminder "${title}" is due.`,
            date:
              reminder.dueDate ||
              reminder.reminderDate ||
              reminder.date,
          });
        } else if (
          status !== 'completed' &&
          status !== 'paid' &&
          status !== 'cancelled'
        ) {
          generated.push({
            id: `reminder-upcoming-${reminder._id}`,
            title: `Upcoming reminder: "${title}".`,
            date:
              reminder.dueDate ||
              reminder.reminderDate ||
              reminder.date,
          });
        }
      });

      /*
       * AI ANALYSIS NOTIFICATIONS
       *
       * We only read existing AI history.
       * This does NOT call Gemini.
       */
      if (agreements.length > 0) {
        const historyResponses =
          await Promise.all(
            agreements.map((agreement) =>
              api
                .get(
                  `/ai/agreements/${agreement._id}/history`
                )
                .then((response) => ({
                  agreement,
                  analyses:
                    response.data?.analyses ||
                    [],
                }))
                .catch(() => ({
                  agreement,
                  analyses: [],
                }))
            )
          );

        historyResponses.forEach(
          ({
            agreement,
            analyses,
          }) => {
            if (
              !Array.isArray(analyses)
            ) {
              return;
            }

            analyses.forEach(
              (analysis) => {
                if (
                  analysis.type !==
                  'summary' &&
                  analysis.type !==
                  'risk'
                ) {
                  return;
                }

                const analysisType =
                  analysis.type ===
                    'risk'
                    ? 'risk analysis'
                    : 'summary';

                generated.push({
                  id: `ai-${analysis._id}`,
                  title: `AI ${analysisType} for "${agreement.title || agreement.originalFileName}" is available.`,
                  date:
                    analysis.createdAt ||
                    agreement.updatedAt,
                });
              }
            );
          }
        );
      }

      /*
       * SORT NEWEST FIRST
       */
      generated.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.date || 0
            ).getTime();

          const dateB =
            new Date(
              b.date || 0
            ).getTime();

          return dateB - dateA;
        }
      );

      setNotifications(
        generated
      );
    } catch (err) {
      console.error(
        'Failed to load landlord notifications:',
        err.response?.status,
        err.response?.data ||
        err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isRead = (id) =>
    readIds.includes(id);

  const markAsRead = (id) => {
    setReadIds((current) => {
      if (
        current.includes(id)
      ) {
        return current;
      }

      const updated = [
        ...current,
        id,
      ];

      localStorage.setItem(
        READ_NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds =
      notifications.map(
        (notification) =>
          notification.id
      );

    setReadIds(allIds);

    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(allIds)
    );
  };

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !isRead(
            notification.id
          )
      ).length,
    [
      notifications,
      readIds,
    ]
  );

  const formatTime = (date) => {
    if (!date) {
      return 'Recently';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Recently';
    }

    const now =
      new Date();

    const diff =
      now.getTime() -
      parsedDate.getTime();

    const minutes = Math.floor(
      diff / 60000
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min${minutes === 1
          ? ''
          : 's'
        } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${hours === 1
          ? ''
          : 's'
        } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${days === 1
          ? ''
          : 's'
        } ago`;
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

  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Notifications
          </h1>

          <p className="text-text-muted mt-1">
            Stay updated on your properties and agreements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-medium text-lease-600 hover:text-lease-700"
          >
            <CheckCircle2 className="w-4 h-4" />

            Mark all as read
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-risk-red-bg border border-risk-red/20 text-risk-red rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError('')
            }
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white border border-border rounded-xl shadow-sm divide-y divide-border">

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink mx-auto mb-4"></div>

            <p className="text-text-muted">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(
            (notification) => {
              const read =
                isRead(
                  notification.id
                );

              return (
                <div
                  key={
                    notification.id
                  }
                  className={`p-6 flex items-start gap-4 transition-colors ${!read
                      ? 'bg-lease-50/30'
                      : 'hover:bg-paper/50'
                    }`}
                >

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!read
                        ? 'bg-lease-100 text-lease-600'
                        : 'bg-paper text-text-muted border border-border'
                      }`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${!read
                          ? 'font-semibold text-ink'
                          : 'text-ink'
                        }`}
                    >
                      {
                        notification.title
                      }
                    </p>

                    <p className="text-xs text-text-muted mt-1">
                      {formatTime(
                        notification.date
                      )}
                    </p>
                  </div>

                  {/* Mark Read */}
                  {!read && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                      className="p-2 text-text-faint hover:text-lease-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            }
          )
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-text-faint mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-ink">
              No notifications
            </h3>

            <p className="text-text-muted mt-1">
              You don't have any notifications yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;