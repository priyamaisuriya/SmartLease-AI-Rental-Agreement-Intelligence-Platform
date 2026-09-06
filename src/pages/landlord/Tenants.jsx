import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Phone, Mail } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { landlordTenants } from '../../data/landlordMockData';

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = landlordTenants.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Tenant Name', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lease-100 text-lease-700 flex items-center justify-center font-bold text-sm">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium text-ink">{row.name}</span>
        </div>
      )
    },
    { header: 'Property', accessor: 'property' },
    { header: 'Start Date', accessor: 'start' },
    { 
      header: 'Contractual Rent', 
      accessor: 'rent',
      render: (row) => <span className="font-medium">₹{row.rent.toLocaleString()}</span>
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
          <Link to={`/landlord/tenants/${row.id}`} className="p-1 text-ink-soft hover:text-lease-600 transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="p-1 text-ink-soft hover:text-good-600 transition-colors" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 text-ink-soft hover:text-signal-600 transition-colors" title="Email">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">My Tenants</h1>
          <p className="text-ink-soft mt-1">Manage all active and past tenants across your properties.</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by tenant or property..." 
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

export default Tenants;
