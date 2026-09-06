import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Download, BrainCircuit, UploadCloud } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';

const mockAgreements = [
  { id: '1', title: 'Sunset_Apt_Lease_2026.pdf', tenant: 'Rahul Sharma', property: 'Sunset Apartments 4B', date: 'Jan 1, 2026', risk: 'Low' },
  { id: '2', title: 'Lakeview_Residency_Agreement.pdf', tenant: 'Priya Patel', property: 'Lakeview Residency', date: 'Mar 15, 2026', risk: 'Medium' },
  { id: '3', title: 'Oakwood_Contract_Draft.pdf', tenant: 'Anita Desai', property: 'Oakwood Heights', date: 'Nov 1, 2025', risk: 'High' },
];

const Agreements = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = mockAgreements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Agreement', 
      accessor: 'title',
      render: (row) => <span className="font-medium text-ink">{row.title}</span>
    },
    { header: 'Tenant', accessor: 'tenant' },
    { header: 'Property', accessor: 'property' },
    { header: 'Start Date', accessor: 'date' },
    { 
      header: 'Risk Score', 
      accessor: 'risk',
      render: (row) => <StatusBadge status={`${row.risk} Risk`} />
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/landlord/analysis/${row.id}`} className="p-1 text-lease-600 hover:text-lease-700 transition-colors" title="View AI Analysis">
            <BrainCircuit className="w-5 h-5" />
          </Link>
          <button className="p-1 text-ink-soft hover:text-ink transition-colors" title="Download Document">
            <Download className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Rental Agreements</h1>
          <p className="text-ink-soft mt-1">Manage and analyze your active rental contracts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Agreement</span>
        </button>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search agreements or tenants..." 
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

export default Agreements;
