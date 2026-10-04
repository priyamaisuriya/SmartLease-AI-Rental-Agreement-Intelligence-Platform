import React, {
  useEffect,
  useState
} from 'react';

import { Link } from 'react-router-dom';

import {
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';

import api from '../services/api';


// ============================================================
// REQUESTS PAGE
// ============================================================

const Requests = () => {

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const statusBadge = (status) => {

    const normalizedStatus =
      String(status || '')
        .toLowerCase();


    const statusMap = {

      pending: {
        label: 'Pending',
        css:
          'bg-warn-50 text-warn-600'
      },

      active: {
        label: 'Accepted',
        css:
          'bg-good-50 text-good-600'
      },

      cancelled: {
        label: 'Rejected',
        css:
          'bg-bad-50 text-bad-600'
      },

      completed: {
        label: 'Completed',
        css:
          'bg-ink/5 text-text-muted'
      }

    };


    const current =
      statusMap[
        normalizedStatus
      ] || {

        label: status || 'Unknown',

        css:
          'bg-ink/5 text-text-muted'
      };


    return (

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${current.css}`}
      >

        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>

        {current.label}

      </span>

    );
  };


  // ==========================================================
  // FETCH REQUESTS
  // ==========================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);

      setError('');


      const response =
        await api.get(
          '/rentals/my-rentals'
        );


      const data =
        response.data?.rentals ||
        response.data ||
        [];


      setRequests(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (err) {

      console.error(
        'Failed to fetch rental requests:',
        err.response?.data ||
          err.message
      );


      setError(
        err.response?.data?.message ||
        'Failed to load rental requests.'
      );


    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // LOAD ON PAGE OPEN
  // ==========================================================

  useEffect(() => {

    fetchRequests();

  }, []);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return '—';
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '—';
    }


    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  // ==========================================================
  // GET PROPERTY DATA
  // ==========================================================

  const getProperty =
    (request) => {

      if (
        request?.property &&
        typeof request.property ===
          'object'
      ) {

        return request.property;
      }

      return null;
    };


  // ==========================================================
  // GET LANDLORD DATA
  // ==========================================================

  const getLandlord =
    (request) => {

      if (
        request?.landlord &&
        typeof request.landlord ===
          'object'
      ) {

        return request.landlord;
      }

      return null;
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="fade-in">

        <h1 className="font-display text-2xl font-semibold text-ink">
          My rental requests
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Track the status of properties you've requested to rent.
        </p>


        <div className="mt-8 flex items-center justify-center rounded-xl2 border border-border bg-white p-12 shadow-soft">

          <Loader2
            className="animate-spin text-lease-600"
            size={24}
          />

          <span className="ml-3 text-sm text-text-muted">
            Loading your requests...
          </span>

        </div>

      </div>

    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="fade-in">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="font-display text-2xl font-semibold text-ink">
            My rental requests
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Track the status of properties you've requested to rent.
          </p>

        </div>


        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
        >

          <RefreshCw size={14} />

          Refresh

        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={fetchRequests}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Try Again
          </button>

        </div>

      )}


      {/* ======================================================
          REQUEST LIST
      ====================================================== */}

      <div className="mt-6 space-y-4">

        {requests.length > 0 ? (

          requests.map(
            (request) => {

              const property =
                getProperty(
                  request
                );

              const landlord =
                getLandlord(
                  request
                );


              const propertyId =
                property?._id ||
                request.property;


              const propertyName =
                property?.title ||
                'Property';


              const location =
                property
                  ? [
                      property.city,
                      property.state
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : 'Location unavailable';


              const landlordName =
                landlord?.name ||
                'Landlord';


              const rent =
                request.monthlyRent ??
                property?.monthlyRent ??
                0;


              return (

                <div
                  key={request._id}
                  className="flex flex-col gap-4 rounded-xl2 border border-border bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* =================================================
                      PROPERTY INFORMATION
                  ================================================= */}

                  <div className="min-w-0">

                    <p className="font-display text-sm font-semibold text-ink">

                      {propertyName}

                    </p>


                    <p className="mt-1 text-xs text-text-faint">

                      {location}

                      {' · '}

                      Landlord: {landlordName}

                    </p>


                    <p className="mt-1 text-xs text-text-faint">

                      Requested{' '}

                      {formatDate(
                        request.bookingDate ||
                        request.createdAt
                      )}

                      {' · '}

                      Rent ₹
                      {Number(
                        rent
                      ).toLocaleString(
                        'en-IN'
                      )}
                      /mo

                    </p>


                    {/* ACCEPTED MESSAGE */}

                    {request.status ===
                      'active' && (

                      <p className="mt-2 text-xs font-medium text-good-600">

                        ✓ Your request has been accepted by the landlord.

                      </p>

                    )}


                    {/* PENDING MESSAGE */}

                    {request.status ===
                      'pending' && (

                      <p className="mt-2 text-xs text-warn-600">

                        Waiting for landlord approval.

                      </p>

                    )}


                    {/* REJECTED MESSAGE */}

                    {request.status ===
                      'cancelled' && (

                      <p className="mt-2 text-xs text-bad-600">

                        This rental request was rejected.

                      </p>

                    )}

                  </div>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="flex shrink-0 items-center gap-3">

                    {statusBadge(
                      request.status
                    )}


                    {propertyId && (

                      <Link
                        to={`/properties/${propertyId}`}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                      >
                        View Details
                      </Link>

                    )}

                  </div>

                </div>

              );

            }

          )

        ) : (

          /* =====================================================
             EMPTY STATE
          ====================================================== */

          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">

            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">

              <Search size={20} />

            </span>


            <p className="font-display text-base font-semibold text-ink">

              No rental requests yet

            </p>


            <p className="mt-1.5 max-w-sm text-sm text-text-faint">

              Browse properties and send a request to get started.

            </p>

          </div>

        )}

      </div>

    </div>

  );
};


export default Requests;