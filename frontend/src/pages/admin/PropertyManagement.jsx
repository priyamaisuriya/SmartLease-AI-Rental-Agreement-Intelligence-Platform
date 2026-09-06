import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { adminPropertiesData } from '../../data/adminMockData';

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = adminPropertiesData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Property', 
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-border overflow-hidden flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="property" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-medium text-ink">{row.title}</div>
            <div className="text-xs text-text-muted">{row.location}</div>
          </div>
        </div>
      )
    },
    { header: 'Owner', accessor: 'owner' },
    { 
      header: 'Listed Rent', 
      accessor: 'rent',
      render: (row) => <span className="font-medium">₹{row.rent.toLocaleString()}</span>
    },
    { header: 'Type', accessor: 'type' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { header: 'Created', accessor: 'created' },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-text-muted hover:text-lease-600 transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'Pending' && (
            <>
              <button className="p-1 text-text-muted hover:text-good-600 transition-colors" title="Approve">
                <CheckCircle className="w-4 h-4" />
              </button>
              <button className="p-1 text-text-muted hover:text-bad-600 transition-colors" title="Reject">
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Property Management</h1>
          <p className="text-text-muted mt-1">Monitor all properties on the platform.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search properties or owners..." 
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
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-paper/30">
          <div>Showing 1 to {filteredData.length} of {filteredData.length} results</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-border disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-border disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
