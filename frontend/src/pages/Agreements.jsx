import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Agreements = () => {
  const navigate = useNavigate();

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch agreements
  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/agreements/my-agreements');

        console.log('My agreements response:', response.data);

        setAgreements(response.data.agreements || []);
      } catch (err) {
        console.error('Failed to load agreements:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load your agreements.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get file extension
  const getFileType = (fileName) => {
    if (!fileName) return 'FILE';

    const extension = fileName.split('.').pop();

    return extension ? extension.toUpperCase() : 'FILE';
  };

  // Status badge
  const statusBadge = (status) => {
    const normalizedStatus = String(status || '').toLowerCase();

    const map = {
      active: 'bg-good-50 text-good-600',
      expired: 'bg-bad-50 text-bad-600',
      terminated: 'bg-bad-50 text-bad-600',
      draft: 'bg-ink/5 text-text-muted',
      processing: 'bg-lease-50 text-lease-700',
      completed: 'bg-good-50 text-good-600',
    };

    const css =
      map[normalizedStatus] || 'bg-ink/5 text-text-muted';

    const label =
      normalizedStatus.charAt(0).toUpperCase() +
      normalizedStatus.slice(1);

    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${css}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>

        {label || 'Unknown'}
      </span>
    );
  };

  // Risk badge
  const riskBadge = (level) => {
    if (!level) return null;

    const normalizedLevel = String(level).toLowerCase();

    const map = {
      low: 'bg-good-50 text-good-600 border-good-500/20',
      medium: 'bg-warn-50 text-warn-600 border-warn-500/20',
      high: 'bg-bad-50 text-bad-600 border-bad-500/20',
    };

    const css =
      map[normalizedLevel] ||
      'bg-ink/5 text-text-muted border-border';

    const label =
      normalizedLevel.charAt(0).toUpperCase() +
      normalizedLevel.slice(1);

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${css}`}
      >
        {label} Risk
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            My rental agreements
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Every agreement linked to your rentals.
          </p>
        </div>

        {/* Loading */}
        <div className="mt-6 flex items-center justify-center rounded-xl2 border border-border bg-white/60 px-6 py-14">
          <p className="text-sm text-text-faint">
            Loading your agreements...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            My rental agreements
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Every agreement linked to your rentals.
          </p>
        </div>

        {/* Error */}
        <div className="mt-6 rounded-xl2 border border-border bg-white px-6 py-10 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-lease-600 px-4 py-2 text-xs font-medium text-white hover:bg-lease-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main page
  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          My rental agreements
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Every agreement linked to your rentals.
        </p>
      </div>

      {/* Agreements */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {agreements.length > 0 ? (
          agreements.map((a) => {
            const property = a.property || {};
            const tenant = a.tenant || {};

            const analysis =
              a.latestRisk || a.riskAnalysis;

            return (
              <div
                key={a._id}
                className="rounded-xl2 border border-border bg-white p-5 shadow-soft"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-lease-50 text-[10px] font-display font-bold text-lease-600">
                    {getFileType(a.originalFileName)}
                  </span>

                  {riskBadge(
                    analysis?.riskLevel || a.riskLevel
                  )}
                </div>

                {/* Agreement information */}
                <p
                  className="mt-3 truncate font-display text-sm font-semibold text-ink"
                  title={a.originalFileName}
                >
                  {a.title || a.originalFileName}
                </p>

                <p className="mt-1 text-xs text-text-faint">
                  {property.title || 'Rental agreement'}
                </p>

                <p className="mt-1 text-xs text-text-faint">
                  Tenant: {tenant.name || 'Not available'}
                </p>

                <p className="mt-1 text-xs text-text-faint">
                  Uploaded {formatDate(a.uploadedAt)}
                </p>

                {/* Status */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {statusBadge(a.status)}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {/* View */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/landlord/analysis/${a._id}`
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
                  >
                    View
                  </button>

                  {/* Analyze */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/landlord/analysis/${a._id}`
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
                  >
                    Analyze
                  </button>

                  {/* AI Chat */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/landlord/chat/${a._id}`
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
                  >
                    Chat with AI
                  </button>

                  {/* Download */}
                  {a.fileUrl && (
                    <a
                      href={
                        a.fileUrl.startsWith('http')
                          ? a.fileUrl
                          : `http://localhost:5000${a.fileUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center md:col-span-2 xl:col-span-3">
            <p className="font-display text-base font-semibold text-ink">
              No rental agreements
            </p>

            <p className="mt-1.5 max-w-sm text-sm text-text-faint">
              Agreements linked to your rentals will appear
              here.
            </p>

            <Link
              to="/landlord/rental-requests"
              className="mt-5 rounded-lg bg-lease-600 px-4 py-2 text-xs font-medium text-white hover:bg-lease-700"
            >
              View Rental Requests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agreements;