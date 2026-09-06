import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Download, Eye } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { auditLogsData } from '../../data/adminMockData';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = auditLogsData.filter(item => 
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Admin / User', accessor: 'user', render: (row) => <span className="font-medium text-ink">{row.user}</span> },
    { header: 'Action', accessor: 'action' },
    { header: 'Module', accessor: 'module' },
    { header: 'Description', accessor: 'desc', render: (row) => <span className="text-sm">{row.desc}</span> },
    { header: 'Date & Time', accessor: 'time' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lease-600" /> Audit Logs
          </h1>
          <p className="text-text-muted mt-1">Track system-wide administrative actions and events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search logs..." 
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

export default AuditLogs;
