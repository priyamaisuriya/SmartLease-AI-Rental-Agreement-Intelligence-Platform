import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Eye, Archive, CheckCircle, RotateCcw, Star, Loader2, X } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const fmtDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-line'}`}
      />
    ))}
  </div>
);

const FeedbackManagement = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [selected, setSelected] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/feedback');
      setFeedbackData(res.data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError('Failed to load feedback data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const setStatus = async (id, status) => {
    try {
      setBusyId(id);
      await api.patch(`/admin/feedback/${id}/status`, { status });
      setFeedbackData((prev) => prev.map((f) => (f._id === id ? { ...f, status } : f)));
      setSelected((cur) => (cur && cur._id === id ? { ...cur, status } : cur));
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update feedback status.');
    } finally {
      setBusyId('');
    }
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return feedbackData.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (ratingFilter && item.rating !== Number(ratingFilter)) return false;
      if (!q) return true;
      return (
        (item.user?.name || item.userName || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.feedback || '').toLowerCase().includes(q)
      );
    });
  }, [feedbackData, searchTerm, statusFilter, ratingFilter]);

  const summary = useMemo(() => {
    const total = feedbackData.length;
    const avg = total ? feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / total : 0;
    return {
      total,
      fresh: feedbackData.filter((f) => f.status === 'new').length,
      avg: total ? avg.toFixed(1) : '—',
    };
  }, [feedbackData]);

  const columns = [
    {
      header: 'User',
      accessor: 'user',
      render: (row) => <span className="font-medium text-ink">{row.user?.name || row.userName || 'Anonymous'}</span>,
    },
    { header: 'Rating', accessor: 'rating', render: (row) => <Stars rating={row.rating} /> },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Feedback',
      accessor: 'feedback',
      render: (row) => <span className="text-sm truncate block max-w-xs">{row.feedback}</span>,
    },
    { header: 'Date', accessor: 'createdAt', render: (row) => <span>{fmtDate(row.createdAt)}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={cap(row.status)} /> },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1 text-text-muted hover:text-lease-600 transition-colors"
            title="View details"
            onClick={() => setSelected(row)}
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'new' && (
            <button
              className="p-1 text-text-muted hover:text-green-600 transition-colors disabled:opacity-40"
              title="Mark as reviewed"
              disabled={busyId === row._id}
              onClick={() => setStatus(row._id, 'reviewed')}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {row.status === 'archived' ? (
            <button
              className="p-1 text-text-muted hover:text-ink transition-colors disabled:opacity-40"
              title="Restore"
              disabled={busyId === row._id}
              onClick={() => setStatus(row._id, 'new')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="p-1 text-text-muted hover:text-ink transition-colors disabled:opacity-40"
              title="Archive"
              disabled={busyId === row._id}
              onClick={() => setStatus(row._id, 'archived')}
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const inputCls =
    'px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500';

  return (
    <div className="space-y-6 fade-in pb-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">User Feedback</h1>
        <p className="text-text-muted mt-1">Review feedback and ratings from platform users.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total', summary.total],
          ['New', summary.fresh],
          ['Average rating', summary.avg],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-border rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
            <div className="text-2xl font-semibold text-ink mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user, category or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputCls} w-full pl-9`}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className={inputCls}>
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} star{r === 1 ? '' : 's'}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-lease-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-risk-red">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 text-text-muted">No feedback matches these filters.</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-lease-800/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-ink text-lg">Feedback Details</h3>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-ink" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{selected.user?.name || selected.userName || 'Anonymous'}</p>
                  {selected.user?.email && <p className="text-sm text-text-muted">{selected.user.email}</p>}
                </div>
                <StatusBadge status={cap(selected.status)} />
              </div>
              <div className="flex items-center gap-3">
                <Stars rating={selected.rating} />
                <span className="text-sm text-text-muted">{selected.category} · {fmtDate(selected.createdAt)}</span>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap p-3 bg-paper border border-border rounded-lg">
                {selected.feedback}
              </p>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              {selected.status === 'new' && (
                <button
                  onClick={() => setStatus(selected._id, 'reviewed')}
                  disabled={busyId === selected._id}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper disabled:opacity-50"
                >
                  Mark reviewed
                </button>
              )}
              {selected.status === 'archived' ? (
                <button
                  onClick={() => setStatus(selected._id, 'new')}
                  disabled={busyId === selected._id}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper disabled:opacity-50"
                >
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => setStatus(selected._id, 'archived')}
                  disabled={busyId === selected._id}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper disabled:opacity-50"
                >
                  Archive
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
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

export default FeedbackManagement;
