import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const PAGE_SIZE = 20;
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown');

const fmtDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const imageUrl = (images) => {
  const first = images && images[0];
  if (!first) return FALLBACK_IMAGE;
  return first.startsWith('http') ? first : `${API_ORIGIN}${first}`;
};

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

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

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/admin/properties', { params });
      setProperties(res.data.properties || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleStatus = async (property) => {
    const deactivating = property.status !== 'inactive';
    let reason = '';

    if (deactivating) {
      const input = window.prompt(
        `Deactivate "${property.title}"? It will be hidden from tenants and the landlord will be notified.\n\nOptional reason:`,
        ''
      );
      if (input === null) return;
      reason = input;
    } else if (!window.confirm(`Reactivate "${property.title}"? It will be visible to tenants again.`)) {
      return;
    }

    try {
      setBusyId(property._id);
      await api.patch(`/admin/properties/${property._id}/status`, {
        status: deactivating ? 'inactive' : 'available',
        reason,
      });
      await fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property status');
    } finally {
      setBusyId('');
    }
  };

  const inputCls =
    'px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500';

  return (
    <div className="space-y-6 fade-in pb-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Property Management</h1>
        <p className="text-text-muted mt-1">Monitor and moderate all properties on the platform.</p>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, city, state or address..."
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
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <div className="p-4 text-sm text-risk-red bg-risk-red-bg">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Listed Rent</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No properties found.</td></tr>
              ) : properties.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-border overflow-hidden flex-shrink-0">
                        <img src={imageUrl(p.images)} alt="property" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-ink">{p.title}</div>
                        <div className="text-xs text-text-muted">
                          {[p.city, p.state].filter(Boolean).join(', ') || 'No location'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.landlord?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 font-medium">₹{Number(p.monthlyRent || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{cap(p.propertyType)}</td>
                  <td className="px-4 py-3"><StatusBadge status={cap(p.status)} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/properties/${p._id}`}
                        className="p-1 text-text-muted hover:text-lease-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {p.status !== 'rented' && (
                        <button
                          onClick={() => toggleStatus(p)}
                          disabled={busyId === p._id}
                          className="p-1 text-text-muted hover:text-[#C1443C] transition-colors disabled:opacity-40"
                          title={p.status === 'inactive' ? 'Reactivate listing' : 'Deactivate listing'}
                        >
                          {p.status === 'inactive' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-paper/30">
          <span>{pagination.total} propert{pagination.total === 1 ? 'y' : 'ies'}</span>
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
    </div>
  );
};

export default PropertyManagement;
