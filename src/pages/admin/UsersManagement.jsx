import React, { useState } from 'react';
import { Search, Filter, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { usersData } from '../../data/adminMockData';
import { Link } from 'react-router-dom';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = usersData.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'User', 
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-ink">{row.name}</div>
          <div className="text-xs text-ink-soft">{row.email}</div>
        </div>
      )
    },
    { header: 'Role', accessor: 'role' },
    { header: 'Properties', accessor: 'properties' },
    { header: 'Agreements', accessor: 'agreements' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { header: 'Joined Date', accessor: 'joined' },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/users/${row.id}`} className="p-1 text-ink-soft hover:text-lease-600 transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="p-1 text-ink-soft hover:text-lease-600 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-ink-soft hover:text-bad-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Users</h1>
          <p className="text-ink-soft mt-1">Manage users and platform accounts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg hover:bg-lease-700 transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
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

        {/* Table */}
        <DataTable columns={columns} data={filteredUsers} />
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-line flex items-center justify-between text-sm text-ink-soft bg-canvas/30">
          <div>Showing 1 to {filteredUsers.length} of {filteredUsers.length} results</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-line rounded hover:bg-line disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-line rounded hover:bg-line disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
