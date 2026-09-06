import React, { useState } from 'react';
import { Search, Filter, Eye, Archive, Star } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { feedbackData } from '../../data/adminMockData';

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = feedbackData.filter(item => 
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.feedback.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'User', 
      accessor: 'user',
      render: (row) => <span className="font-medium text-ink">{row.user}</span>
    },
    { 
      header: 'Rating', 
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < row.rating ? 'fill-warn-500 text-warn-500' : 'text-line'}`} 
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
    { header: 'Date', accessor: 'date' },
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
          <button className="p-1 text-text-muted hover:text-ink transition-colors" title="Archive">
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

        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
};

export default FeedbackManagement;
