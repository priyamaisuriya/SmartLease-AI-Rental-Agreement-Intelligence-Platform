import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { landlordRentalRequests } from '../../data/landlordMockData';

const RentalRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = landlordRentalRequests.filter(item => 
    item.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Tenant Name', 
      accessor: 'tenant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lease-100 text-lease-700 flex items-center justify-center font-bold text-sm">
            {row.tenant.charAt(0)}
          </div>
          <span className="font-medium text-ink">{row.tenant}</span>
        </div>
      )
    },
    { header: 'Property', accessor: 'property' },
    { 
      header: 'Listed Rent', 
      accessor: 'rent',
      render: (row) => <span className="font-medium">₹{row.rent.toLocaleString()}</span>
    },
    { header: 'Request Date', accessor: 'date' },
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
          <button className="p-1 text-text-muted hover:text-lease-600 transition-colors" title="View Request Details">
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'Pending' && (
            <>
              <button className="p-1 text-text-muted hover:text-good-600 transition-colors" title="Accept Request">
                <CheckCircle className="w-4 h-4" />
              </button>
              <button className="p-1 text-text-muted hover:text-bad-600 transition-colors" title="Reject Request">
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
          <h1 className="text-2xl font-display font-bold text-ink">Rental Requests</h1>
          <p className="text-text-muted mt-1">Review and manage incoming tenant applications.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by tenant or property..." 
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

export default RentalRequests;
