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
          <div className="text-xs text-text-muted">{row.email}</div>
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
          <Link to={`/admin/users/${row.id}`} className="p-1 text-text-muted hover:text-ink transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="p-1 text-text-muted hover:text-gold-deep transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 text-text-muted hover:text-[#C1443C] transition-colors">
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
          <h1 className="text-[26px] font-serif font-medium m-0 text-ink">Users</h1>
          <p className="text-text-muted mt-1 text-[14.5px]">Manage users and platform accounts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-[16px] py-[9px] bg-ink text-paper rounded-lg hover:bg-ink-dark shadow-sm transition-colors font-semibold text-[13.5px]">
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20 transition-all placeholder:text-text-faint"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-[16px] py-[9px] bg-white border border-border rounded-lg text-[13.5px] font-medium text-ink hover:bg-paper-card transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={filteredUsers} />
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[13.5px] text-text-muted bg-[#FBFAF7]">
          <div>Showing <span className="font-medium text-ink">1</span> to <span className="font-medium text-ink">{filteredUsers.length}</span> of <span className="font-medium text-ink">{filteredUsers.length}</span> results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-border rounded hover:border-gold-soft hover:text-ink transition-colors disabled:opacity-50 font-medium">Prev</button>
            <button className="px-3 py-1.5 border border-border rounded hover:border-gold-soft hover:text-ink transition-colors disabled:opacity-50 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
