import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { adminRentalRequestsData } from '../../data/adminMockData';

const RentalRequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = adminRentalRequestsData.filter(item => 
    item.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.landlord.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Tenant', accessor: 'tenant', render: (row) => <span className="font-medium">{row.tenant}</span> },
    { header: 'Property', accessor: 'property' },
    { header: 'Landlord', accessor: 'landlord' },
    { 
      header: 'Listed Rent', 
      accessor: 'rent',
      render: (row) => <span>₹{row.rent.toLocaleString()}</span>
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
          <button className="p-1 text-ink-soft hover:text-lease-600 transition-colors" title="View Request Details">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Rental Requests</h1>
          <p className="text-ink-soft mt-1">Overview of all rental requests on the platform.</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by tenant, landlord, or property..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-canvas border border-line rounded-lg text-sm font-medium text-ink hover:bg-line/50 transition-colors">
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

export default RentalRequestsManagement;
