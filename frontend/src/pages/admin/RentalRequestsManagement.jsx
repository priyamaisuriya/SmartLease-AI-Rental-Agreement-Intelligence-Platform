import React, { useCallback, useEffect, useState } from 'react';
import { Search, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  'pending', 'accepted', 'rejected', 'agreement_pending', 'agreement_accepted',
  'payment_pending', 'payment_success', 'confirmed', 'active', 'completed',
  'cancelled', 'expired', 'conflict',
];

const statusLabel = (status) =>
  status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown';

const fmtDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const RentalRequestsManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestToView, setRequestToView] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/admin/rentals', { params });
      setRentals(res.data.rentals || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rental requests.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/rentals/stats');
        setStats(res.data);
      } catch (err) {
        // Stats are optional context; the table still works without them.
      }
    };
    loadStats();
  }, []);

  const inputCls =
    'px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500';

  return (
    <div className="space-y-6 fade-in pb-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Rental Requests</h1>
        <p className="text-text-muted mt-1">Track every rental request through the booking workflow.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ['Total', stats.total],
            ['Pending', stats.pending],
            ['Confirmed', stats.confirmed],
            ['Active', stats.active],
            ['Conflicts', stats.conflict],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
              <div className="text-2xl font-semibold text-ink mt-1">{value ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tenant, landlord, or property..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputCls} w-full pl-9`}
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>

        {error && <div className="p-4 text-sm text-risk-red bg-risk-red-bg">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Landlord</th>
                <th className="px-4 py-3">Rental Period</th>
                <th className="px-4 py-3">Monthly Rent</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
              ) : rentals.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">No rental requests found.</td></tr>
              ) : rentals.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-ink">{r.tenant?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">{r.property?.title || 'Unknown Property'}</td>
                  <td className="px-4 py-3">{r.landlord?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
                  <td className="px-4 py-3">{money(r.monthlyRent)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={statusLabel(r.status)} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setRequestToView(r)}
                      className="p-1 text-text-muted hover:text-lease-600 transition-colors"
                      title="View Request Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-paper/30">
          <span>{pagination.total} request{pagination.total === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-border rounded-lg disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
              disabled={page >= (pagination.totalPages || 1) || loading}
              className="p-1.5 border border-border rounded-lg disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {requestToView && (
        <div className="fixed inset-0 z-50 bg-lease-800/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-ink text-lg">Rental Request Details</h3>
              <button onClick={() => setRequestToView(null)} className="text-text-muted hover:text-ink" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-semibold text-ink text-lg">{requestToView.property?.title || 'Unknown Property'}</h4>
                  <p className="text-sm text-text-muted">
                    {[requestToView.property?.address, requestToView.property?.city, requestToView.property?.state]
                      .filter(Boolean).join(', ') || 'Location not specified'}
                  </p>
                </div>
                <StatusBadge status={statusLabel(requestToView.status)} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-text-muted">Monthly Rent</p>
                  <p className="font-medium text-ink">{money(requestToView.monthlyRent)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Security Deposit</p>
                  <p className="font-medium text-ink">{money(requestToView.securityDeposit)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Rental Period</p>
                  <p className="font-medium text-ink">{fmtDate(requestToView.startDate)} – {fmtDate(requestToView.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Requested On</p>
                  <p className="font-medium text-ink">{fmtDate(requestToView.createdAt)}</p>
                </div>
                {requestToView.agreementAcceptedAt && (
                  <div>
                    <p className="text-xs text-text-muted">Agreement Accepted (v{requestToView.acceptedAgreementVersion})</p>
                    <p className="font-medium text-ink">{fmtDate(requestToView.agreementAcceptedAt)}</p>
                  </div>
                )}
                {requestToView.paymentVerifiedAt && (
                  <div>
                    <p className="text-xs text-text-muted">Payment Verified</p>
                    <p className="font-medium text-ink">{fmtDate(requestToView.paymentVerifiedAt)}</p>
                  </div>
                )}
                {requestToView.confirmedAt && (
                  <div>
                    <p className="text-xs text-text-muted">Booking Confirmed</p>
                    <p className="font-medium text-ink">{fmtDate(requestToView.confirmedAt)}</p>
                  </div>
                )}
              </div>

              {requestToView.rejectionReason && (
                <div className="p-3 rounded-lg bg-paper border border-border text-sm">
                  <p className="text-xs text-text-muted mb-1">Reason / note</p>
                  <p className="text-ink">{requestToView.rejectionReason}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <h5 className="font-semibold text-ink text-sm mb-3">Tenant</h5>
                <p className="font-medium text-ink">{requestToView.tenant?.name || 'Unknown'}</p>
                <p className="text-sm text-text-muted">{requestToView.tenant?.email || 'N/A'}</p>
                <p className="text-sm text-text-muted">{requestToView.tenant?.phone || ''}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <h5 className="font-semibold text-ink text-sm mb-3">Landlord</h5>
                <p className="font-medium text-ink">{requestToView.landlord?.name || 'Unknown'}</p>
                <p className="text-sm text-text-muted">{requestToView.landlord?.email || 'N/A'}</p>
                <p className="text-sm text-text-muted">{requestToView.landlord?.phone || ''}</p>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end">
              <button
                onClick={() => setRequestToView(null)}
                className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalRequestsManagement;
