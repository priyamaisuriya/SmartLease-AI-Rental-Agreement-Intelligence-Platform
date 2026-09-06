import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Eye, Edit, Trash2, X } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [userToEdit, setUserToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      
      const formattedUsers = res.data.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // raw role for form
        displayRole: user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' '),
        properties: user.properties?.length || 0,
        agreements: 0,
        status: user.isActive ? 'Active' : 'Inactive',
        joined: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }));
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditForm({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    try {
      setIsActionLoading(true);
      await api.put(`/users/${userToEdit.id}`, editForm);
      setUserToEdit(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
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
    { header: 'Role', accessor: 'displayRole' },
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
          <button 
            onClick={() => openEditModal(row)}
            className="p-1 text-text-muted hover:text-gold-deep transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1 text-text-muted hover:text-[#C1443C] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading && users.length === 0) {
    return <div className="p-8 text-center text-text-muted fade-in">Loading users...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-risk-red fade-in">{error}</div>;
  }

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-serif font-medium m-0 text-ink">Users</h1>
          <p className="text-text-muted mt-1 text-[14.5px]">Manage users and platform accounts.</p>
        </div>
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
          <div>Showing <span className="font-medium text-ink">{filteredUsers.length > 0 ? 1 : 0}</span> to <span className="font-medium text-ink">{filteredUsers.length}</span> of <span className="font-medium text-ink">{filteredUsers.length}</span> results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-border rounded hover:border-gold-soft hover:text-ink transition-colors disabled:opacity-50 font-medium" disabled>Prev</button>
            <button className="px-3 py-1.5 border border-border rounded hover:border-gold-soft hover:text-ink transition-colors disabled:opacity-50 font-medium" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 bg-lease-800/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-ink text-lg">Edit User Details</h3>
              <button onClick={() => setUserToEdit(null)} className="text-text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Role</label>
                <select 
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                  <option value="property_manager">Property Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-dark transition-colors disabled:opacity-50"
                >
                  {isActionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
