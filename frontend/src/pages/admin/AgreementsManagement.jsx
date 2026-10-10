import React, { useCallback, useEffect, useState } from 'react';
import { Search, Eye, Download, Trash2, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const PAGE_SIZE = 20;

const ANALYSIS_LABELS = {
  summary: 'Summary',
  risk: 'Risk',
  clause_explanation: 'Clause',
  question: 'Q&A',
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown');

const fmtDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AgreementsManagement = () => {
  const [agreements, setAgreements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
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

  const fetchAgreements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await api.get('/admin/agreements', { params });
      setAgreements(res.data.agreements || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load agreements from the server.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/agreements/stats');
      setStats(res.data);
    } catch (err) {
      // Optional context only.
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Agreements are private: fetch through the authenticated endpoint as a blob.
  const fetchFile = async (agreement) => {
    const res = await api.get(`/agreements/${agreement._id}/download`, { responseType: 'blob' });
    return new Blob([res.data], { type: res.data.type || 'application/octet-stream' });
  };

  const handleView = async (agreement) => {
    try {
      setBusyId(agreement._id);
      const blob = await fetchFile(agreement);
      const url = URL.createObjectURL(blob);

      if (agreement.fileType === 'pdf') {
        window.open(url, '_blank');
      } else {
        // Word documents cannot render in a tab; save them instead.
        const a = document.createElement('a');
        a.href = url;
        a.download = agreement.originalFileName || 'agreement';
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      alert('Could not open the agreement file. It may have been removed from the server.');
    } finally {
      setBusyId('');
    }
  };

  const handleDownload = async (agreement) => {
    try {
      setBusyId(agreement._id);
      const blob = await fetchFile(agreement);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = agreement.originalFileName || 'agreement';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download the agreement file. It may have been removed from the server.');
    } finally {
      setBusyId('');
    }
  };

  const handleTerminate = async (agreement) => {
    if (!window.confirm(`Terminate "${agreement.title}"? The record is kept for history.`)) return;
    try {
      setBusyId(agreement._id);
      await api.put(`/admin/agreements/${agreement._id}/terminate`);
      await Promise.all([fetchAgreements(), fetchStats()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to terminate agreement');
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (agreement) => {
    if (!window.confirm(`Permanently delete "${agreement.title}" and its AI analyses? This cannot be undone.`)) return;
    try {
      setBusyId(agreement._id);
      await api.delete(`/admin/agreements/${agreement._id}`);
      await Promise.all([fetchAgreements(), fetchStats()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete agreement');
    } finally {
      setBusyId('');
    }
  };

  const inputCls =
    'px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500';

  const iconBtn = 'p-1 text-text-muted transition-colors disabled:opacity-40';

  return (
    <div className="space-y-6 fade-in pb-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Rental Agreements</h1>
        <p className="text-text-muted mt-1">Review uploaded agreements and the AI analysis done on them.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Total', stats.total],
            ['Active', stats.active],
            ['Expired', stats.expired],
            ['Terminated', stats.terminated],
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
              placeholder="Search by agreement title or file name..."
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
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {error && <div className="p-4 text-sm text-risk-red bg-risk-red-bg">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Agreement</th>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Landlord</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tenant Accepted</th>
                <th className="px-4 py-3">AI Analyses</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
              ) : agreements.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">No agreements found.</td></tr>
              ) : agreements.map((a) => {
                const analyses = Object.entries(a.analyses || {});
                const busy = busyId === a._id;
                return (
                  <tr key={a._id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{a.title}</div>
                      <div className="text-xs text-text-muted">
                        {a.originalFileName} · v{a.version || 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">{a.tenant?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{a.landlord?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className={a.property ? '' : 'text-text-faint italic'}>
                        {a.property?.title || 'Not Linked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.uploadedAt || a.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={cap(a.status)} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.acceptedAt ? fmtDate(a.acceptedAt) : <span className="text-text-faint">Not yet</span>}
                    </td>
                    <td className="px-4 py-3">
                      {analyses.length === 0 ? (
                        <span className="text-text-faint">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {analyses.map(([type, count]) => (
                            <span key={type} className="px-2 py-0.5 text-xs rounded-full bg-paper border border-border text-ink">
                              {ANALYSIS_LABELS[type] || type} {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(a)} disabled={busy} className={`${iconBtn} hover:text-lease-600`} title="View file">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownload(a)} disabled={busy} className={`${iconBtn} hover:text-lease-600`} title="Download file">
                          <Download className="w-4 h-4" />
                        </button>
                        {a.status !== 'terminated' && (
                          <button onClick={() => handleTerminate(a)} disabled={busy} className={`${iconBtn} hover:text-[#B8863B]`} title="Terminate agreement">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(a)} disabled={busy} className={`${iconBtn} hover:text-[#C1443C]`} title="Delete agreement">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-paper/30">
          <span>{pagination.total} agreement{pagination.total === 1 ? '' : 's'}</span>
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

export default AgreementsManagement;
