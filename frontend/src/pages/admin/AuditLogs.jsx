import React, { useCallback, useEffect, useState } from 'react';
import { Search, ShieldCheck, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/admin/StatusBadge';

const PAGE_SIZE = 25;

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so we do not query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await api.get('/admin/logs/stats');
        setModules((res.data.modules || res.data.moduleStats || []).map((m) => m.module || m._id).filter(Boolean));
      } catch (err) {
        // Filter list is optional; the page still works without it.
      }
    };
    loadModules();
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (moduleFilter) params.module = moduleFilter;
      if (statusFilter) params.status = statusFilter;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get('/admin/logs', { params });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, search, moduleFilter, statusFilter, from, to]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const exportCsv = () => {
    const header = ['Date', 'User', 'Role', 'Action', 'Module', 'Description', 'Status'];
    const rows = logs.map((l) => [
      formatDateTime(l.createdAt),
      l.user?.name || 'System',
      l.user?.role || '',
      l.action,
      l.module,
      l.description,
      l.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    'px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500';

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lease-600" /> Audit Logs
          </h1>
          <p className="text-text-muted mt-1">Track system-wide administrative actions and events.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Page (CSV)</span>
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, action or module..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputCls} w-full pl-9`}
            />
          </div>
          <select value={moduleFilter} onChange={resetPage(setModuleFilter)} className={inputCls}>
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={resetPage(setStatusFilter)} className={inputCls}>
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <input type="date" value={from} onChange={resetPage(setFrom)} className={inputCls} aria-label="From date" />
          <input type="date" value={to} onChange={resetPage(setTo)} className={inputCls} aria-label="To date" />
        </div>

        {error && <div className="p-4 text-sm text-risk-red bg-risk-red-bg">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-text-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date &amp; Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No logs match these filters.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l._id}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {l.user?.name || 'System'}
                      {l.user?.role && <span className="block text-xs text-text-muted font-normal">{l.user.role}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-3">{l.module}</td>
                    <td className="px-4 py-3">{l.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status === 'success' ? 'Success' : 'Failed'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <span>{pagination.total} log{pagination.total === 1 ? '' : 's'}</span>
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

export default AuditLogs;
