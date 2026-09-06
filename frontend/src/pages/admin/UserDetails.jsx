import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Ban, Trash2, CheckCircle, X } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { recentActivity } from '../../data/adminMockData';
import api from '../../services/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users');
        const foundUser = res.data.find(u => u._id === id);
        
        if (foundUser) {
          setUser({
            ...foundUser,
            joined: new Date(foundUser.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            properties: foundUser.properties?.length || 0,
            agreements: 0,
            status: foundUser.isActive ? 'Active' : 'Inactive',
            role: foundUser.role
          });
          setEditForm({
            name: foundUser.name,
            email: foundUser.email || '',
            phone: foundUser.phone || '',
            role: foundUser.role
          });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Failed to load user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${user.status === 'Active' ? 'suspend' : 'activate'} this account?`)) return;
    try {
      setIsActionLoading(true);
      await api.put(`/users/${id}/status`, { isActive: user.status !== 'Active' });
      setUser(prev => ({ ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/users/${id}`);
      navigate('/admin/users');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      await api.put(`/users/${id}`, editForm);
      setUser(prev => ({ ...prev, name: editForm.name, email: editForm.email, phone: editForm.phone, role: editForm.role }));
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted fade-in">Loading user profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center fade-in">
        <p className="text-risk-red mb-4">{error || 'User not found'}</p>
        <button onClick={() => navigate('/admin/users')} className="px-4 py-2 bg-ink text-white rounded-lg">
          Back to Users
        </button>
      </div>
    );
  }

  const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ');

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-ink">User Profile</h1>
            <StatusBadge status={user.status} />
          </div>
          <p className="text-text-muted mt-1">Manage user account details and history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Admin Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border text-center">
              <div className="w-20 h-20 bg-lease-100 text-lease-600 rounded-full flex items-center justify-center text-3xl font-display font-bold mx-auto mb-4">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-lg font-semibold text-ink">{user.name}</h2>
              <p className="text-text-muted text-sm">{user.email}</p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-paper text-text-muted rounded-full text-xs font-medium border border-border">
                  {displayRole}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Joined Date</span>
                <span className="font-medium text-ink">{user.joined}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Phone</span>
                <span className="font-medium text-ink">{user.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Properties</span>
                <span className="font-medium text-ink">{user.properties}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Agreements</span>
                <span className="font-medium text-ink">{user.agreements}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-ink mb-4">Admin Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                disabled={isActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper-card transition-colors disabled:opacity-50"
              >
                <Edit className="w-4 h-4" /> Edit Details
              </button>
              
              <button 
                onClick={handleToggleStatus}
                disabled={isActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper-card transition-colors disabled:opacity-50"
              >
                {user.status === 'Active' ? (
                  <><Ban className="w-4 h-4" /> Suspend Account</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Activate Account</>
                )}
              </button>
              
              <button 
                onClick={handleDelete}
                disabled={isActionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-ink hover:bg-paper-card transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete User
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-ink">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border p-6 space-y-4">
              {recentActivity.slice(0, 4).map((activity, idx) => (
                <div key={idx} className="flex gap-4 pt-4 first:pt-0 relative">
                  {idx !== 3 && <div className="absolute left-5 top-10 bottom-0 w-px bg-border"></div>}
                  <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center z-10 border border-border">
                    <span className="w-3 h-3 rounded-full bg-gold-deep"></span>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-ink">{activity.desc}</p>
                    <p className="text-xs text-text-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-lease-800/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-ink text-lg">Edit User Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-ink">
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
                  onClick={() => setIsEditModalOpen(false)}
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

export default UserDetails;
