import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const getInitial = () => {
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({ 
        name: user?.name || '', 
        email: user?.email || '',
        phone: user?.phone || '' 
      });
      setError('');
      setMessage('');
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setMessage('');
      
      await api.put(`/users/${user._id}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
      });
      
      await refreshUser();
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Admin Profile</h1>
      
      {message && (
        <div className="rounded-lg border border-good-500/20 bg-good-50 px-4 py-3 text-sm text-good-600">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-3 text-sm text-bad-600">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="h-32 bg-ink"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-16 mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-paper flex items-center justify-center text-4xl font-bold text-ink flex-shrink-0">
              {getInitial()}
            </div>
            <div className="pt-2 sm:pt-16 flex-1">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-text-muted">Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:border-lease-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-muted">Email</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:border-lease-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-muted">Phone Number</label>
                    <input 
                      name="phone" 
                      type="text" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:border-lease-500" 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                    {user?.name || 'Admin User'} <ShieldCheck className="w-5 h-5 text-lease-600" />
                  </h2>
                  <p className="text-text-muted font-medium capitalize">{user?.role || 'Super Administrator'}</p>
                </>
              )}
            </div>
            <div className="pt-2 sm:pt-16 flex items-start gap-3">
              {isEditing && (
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-ink border border-ink rounded-lg text-sm font-medium text-paper hover:bg-ink-dark transition-colors disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              )}
              <button 
                onClick={handleEditToggle} 
                className="px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-semibold text-ink border-b border-border pb-2">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-text-faint">Email Address</p>
                      <p className="font-medium text-ink mt-0.5">{user?.email || 'admin@smartlease.ai'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-text-faint">Phone Number</p>
                      <p className="font-medium text-ink mt-0.5">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <ShieldCheck className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-text-faint">Role & Permissions</p>
                      <p className="font-medium text-ink mt-0.5 capitalize">{user?.role || 'Super Admin'} (All Access)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
