import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Ban, Trash2, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { usersData, recentActivity } from '../../data/adminMockData';

const UserDetails = () => {
  const { id } = useParams();
  const user = usersData.find(u => u.id === id) || usersData[0]; // Fallback to first user for demo

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
                  {user.role}
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
                <span className="font-medium text-ink">+91 98765 43210</span>
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
                <Edit className="w-4 h-4" /> Edit Details
              </button>
              {user.status === 'Active' ? (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-warn-50 border border-warn-500/20 rounded-lg text-sm font-medium text-warn-700 hover:bg-warn-100 transition-colors">
                  <Ban className="w-4 h-4" /> Suspend Account
                </button>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-good-50 border border-good-500/20 rounded-lg text-sm font-medium text-good-700 hover:bg-good-100 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Activate Account
                </button>
              )}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bad-50 border border-bad-500/20 rounded-lg text-sm font-medium text-bad-700 hover:bg-bad-100 transition-colors">
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
                  <div className="w-10 h-10 rounded-full bg-lease-50 flex-shrink-0 flex items-center justify-center z-10 border border-surface">
                    <span className="w-3 h-3 rounded-full bg-lease-500"></span>
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
    </div>
  );
};

export default UserDetails;
