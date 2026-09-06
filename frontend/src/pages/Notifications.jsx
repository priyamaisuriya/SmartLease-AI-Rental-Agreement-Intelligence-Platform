import React, { useEffect, useState } from 'react';
import api from '../services/api';

const READ_STORAGE_KEY = 'smartlease_read_notifications';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getReadIds = () => {
    try {
      return JSON.parse(
        localStorage.getItem(READ_STORAGE_KEY) || '[]'
      );
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids) => {
    localStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(ids)
    );
  };

  const formatDate = (date) => {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const createNotification = (
    id,
    message,
    date,
    type
  ) => ({
    id,
    message,
    date,
    type,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        rentalsResponse,
        agreementsResponse,
        remindersResponse,
      ] = await Promise.allSettled([
        api.get('/rentals/my-rentals'),
        api.get('/agreements/my-agreements'),
        api.get('/rent-reminders/my-reminders'),
      ]);

      const generatedNotifications = [];

      /*
       * RENTALS
       */
      if (rentalsResponse.status === 'fulfilled') {
        const rentalsData = rentalsResponse.value.data;

        const rentals =
          rentalsData?.rentals ||
          rentalsData?.data ||
          [];

        if (Array.isArray(rentals)) {
          rentals.forEach((rental) => {
            const rentalId = rental._id;

            const propertyTitle =
              rental.property?.title ||
              rental.property?.name ||
              'your rental property';

            if (rental.status === 'active') {
              generatedNotifications.push(
                createNotification(
                  `rental-active-${rentalId}`,
                  `Your rental for ${propertyTitle} is active.`,
                  rental.createdAt ||
                  rental.bookingDate ||
                  rental.startDate,
                  'rental'
                )
              );
            }

            if (rental.status === 'completed') {
              generatedNotifications.push(
                createNotification(
                  `rental-completed-${rentalId}`,
                  `Your rental for ${propertyTitle} has been completed.`,
                  rental.endDate ||
                  rental.updatedAt ||
                  rental.createdAt,
                  'rental'
                )
              );
            }

            if (rental.status === 'cancelled') {
              generatedNotifications.push(
                createNotification(
                  `rental-cancelled-${rentalId}`,
                  `Your rental for ${propertyTitle} has been cancelled.`,
                  rental.updatedAt ||
                  rental.bookingDate,
                  'rental'
                )
              );
            }
          });
        }
      }

      /*
       * AGREEMENTS
       */
      if (agreementsResponse.status === 'fulfilled') {
        const agreementsData =
          agreementsResponse.value.data;

        const agreements =
          agreementsData?.agreements ||
          agreementsData?.data ||
          [];

        if (Array.isArray(agreements)) {
          agreements.forEach((agreement) => {
            const agreementId = agreement._id;

            const propertyTitle =
              agreement.property?.title ||
              'your rental property';

            generatedNotifications.push(
              createNotification(
                `agreement-${agreementId}`,
                `Agreement "${agreement.title || 'Rental Agreement'}" is available for ${propertyTitle}.`,
                agreement.uploadedAt ||
                agreement.createdAt,
                'agreement'
              )
            );
          });
        }
      }

      /*
       * RENT REMINDERS
       */
      if (remindersResponse.status === 'fulfilled') {
        const remindersData =
          remindersResponse.value.data;

        const reminders =
          remindersData?.reminders ||
          remindersData?.data ||
          [];

        if (Array.isArray(reminders)) {
          reminders.forEach((reminder) => {
            const reminderId = reminder._id;

            const propertyTitle =
              reminder.property?.title ||
              reminder.rental?.property?.title ||
              'your rental property';

            let message;

            switch (reminder.status) {
              case 'overdue':
                message = `Rent payment is overdue for ${propertyTitle}.`;
                break;

              case 'due':
                message = `Rent payment is due for ${propertyTitle}.`;
                break;

              case 'paid':
                message = `Rent payment reminder for ${propertyTitle} has been marked as paid.`;
                break;

              case 'cancelled':
                message = `Rent reminder for ${propertyTitle} has been cancelled.`;
                break;

              default:
                message = `Upcoming rent payment for ${propertyTitle}.`;
            }

            generatedNotifications.push(
              createNotification(
                `reminder-${reminderId}`,
                message,
                reminder.dueDate ||
                reminder.createdAt,
                'reminder'
              )
            );
          });
        }
      }

      /*
       * SORT NEWEST FIRST
       */
      generatedNotifications.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        return dateB - dateA;
      });

      const readIds = getReadIds();

      const notificationsWithReadState =
        generatedNotifications.map((notification) => ({
          ...notification,
          read: readIds.includes(notification.id),
        }));

      setNotifs(notificationsWithReadState);
    } catch (err) {
      console.error(
        'Failed to load notifications:',
        err
      );

      setError(
        'Failed to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = (id) => {
    const readIds = getReadIds();

    if (!readIds.includes(id)) {
      readIds.push(id);
      saveReadIds(readIds);
    }

    setNotifs((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
            ...notification,
            read: true,
          }
          : notification
      )
    );
  };

  const markAllRead = () => {
    const allIds = notifs.map(
      (notification) => notification.id
    );

    saveReadIds(allIds);

    setNotifs((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const unreadCount = notifs.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Updates on your rentals, agreements, and reminders.
          </p>
        </div>

        {notifs.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-sm font-medium text-lease-600 hover:text-lease-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Unread count */}
      {notifs.length > 0 && (
        <div className="mt-4 text-xs text-text-faint">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'
            }`
            : 'All notifications are read'}
        </div>
      )}

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
            Loading notifications...
          </p>
        </div>
      ) : notifs.length > 0 ? (

        <div className="mt-6 space-y-3">
          {notifs.map((notification) => (
            <div
              key={notification.id}
              onClick={() =>
                markRead(notification.id)
              }
              className={`flex cursor-pointer items-start gap-3 rounded-xl2 border border-border p-4 transition ${notification.read
                ? 'bg-white'
                : 'bg-lease-50/50'
                }`}
            >

              {/* Unread indicator */}
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read
                  ? 'bg-transparent'
                  : 'bg-lease-600'
                  }`}
              />

              <div className="min-w-0 flex-1">

                <p
                  className={`text-sm ${notification.read
                    ? 'text-text-muted'
                    : 'font-medium text-ink'
                    }`}
                >
                  {notification.message}
                </p>

                <p className="mt-1 text-xs text-text-faint">
                  {formatTime(notification.date)}
                </p>

              </div>

            </div>
          ))}
        </div>

      ) : (

        /* Empty state */
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">

          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
            <span className="text-xl">🔔</span>
          </span>

          <p className="font-display text-base font-semibold text-ink">
            No notifications
          </p>

          <p className="mt-1.5 max-w-sm text-sm text-text-faint">
            You don't have any notifications yet.
          </p>

        </div>
      )}

    </div>
  );
};

export default Notifications;