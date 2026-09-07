import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Archive, Star, Loader2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/feedback');
      setFeedbackData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError('Failed to load feedback data.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.patch(`/admin/feedback/${id}/status`, { status: 'archived' });
      setFeedbackData(prev => 
        prev.map(f => f._id === id ? { ...f, status: 'archived' } : f)
      );
    } catch (err) {
      console.error('Failed to archive feedback:', err);
      alert('Failed to archive feedback.');
    }
  };

  const filteredData = feedbackData.filter(item => 
    (item.user?.name || item.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.feedback.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'User', 
      accessor: 'user',
      render: (row) => <span className="font-medium text-ink">{row.user?.name || row.userName || 'Anonymous'}</span>
    },
    { 
      header: 'Rating', 
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < row.rating ? 'fill-yellow-500 text-yellow-500' : 'text-line'}`} 
            />
          ))}
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Feedback', 
      accessor: 'feedback',
      render: (row) => <span className="text-sm truncate block max-w-xs">{row.feedback}</span>
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      render: (row) => <span>{new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-text-muted hover:text-lease-600 transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className={`p-1 transition-colors ${row.status === 'archived' ? 'text-ink-muted opacity-50 cursor-not-allowed' : 'text-text-muted hover:text-ink'}`}
            title="Archive"
            onClick={() => row.status !== 'archived' && handleArchive(row._id)}
            disabled={row.status === 'archived'}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">User Feedback</h1>
          <p className="text-text-muted mt-1">Review feedback and ratings from platform users.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-lease-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-bad-600">
            {error}
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
