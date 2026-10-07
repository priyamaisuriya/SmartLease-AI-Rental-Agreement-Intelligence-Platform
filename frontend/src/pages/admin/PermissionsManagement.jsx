import React, { useState, useEffect } from 'react';
import { Shield, Check, Save, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const PermissionsManagement = () => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [roles, setRoles] = useState(['tenant', 'landlord', 'admin']);
  const [selectedRole, setSelectedRole] = useState('landlord');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRolePermissions(selectedRole);
  }, [selectedRole]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/permissions');
      setAllPermissions(res.data);
    } catch (err) {
      setError('Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/permissions/role/${role}`);
      setRolePermissions(res.data.permissions || []);
    } catch (err) {
      setError(`Failed to load permissions for ${role}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permission) => {
    if (selectedRole === 'admin') return; // Admin permissions cannot be changed
    setRolePermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    if (selectedRole === 'admin') return;
    try {
      setSaving(true);
      setError(null);
      await api.put(`/permissions/role/${selectedRole}`, { permissions: rolePermissions });
      setSuccessMessage(`Permissions for ${selectedRole} updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions logically for UI display
  const groupPermissions = () => {
    const groups = {};
    allPermissions.forEach(p => {
      const prefix = p.split('-')[0];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(p);
    });
    return groups;
  };

  const groupedPermissions = groupPermissions();

  if (loading && allPermissions.length === 0) {
    return <div className="p-8 text-center text-text-muted">Loading permissions...</div>;
  }

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <Shield className="w-6 h-6 text-lease-600" />
            Role Permissions
          </h1>
          <p className="text-text-muted mt-1">Manage access control and permissions for each role.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving || selectedRole === 'admin'}
          className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="bg-bad-50 border border-bad-200 text-bad-700 p-4 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-good-50 border border-good-200 text-good-700 p-4 rounded-lg flex items-center gap-2 text-sm">
          <Check className="w-5 h-5" /> {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Role Selector Tabs */}
        <div className="flex border-b border-border bg-paper/50">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                selectedRole === role 
                  ? 'border-lease-600 text-lease-700 bg-white' 
                  : 'border-transparent text-text-muted hover:text-ink hover:bg-white/50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="p-6">
          {selectedRole === 'admin' && (
            <div className="mb-6 p-4 bg-lease-50 border border-lease-200 text-lease-800 rounded-lg text-sm">
              <span className="font-semibold">Note:</span> The Admin role automatically has full access to all system features. These permissions cannot be modified.
            </div>
          )}

          {loading && allPermissions.length > 0 ? (
            <div className="py-12 flex justify-center text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-paper border-b border-border px-4 py-2 font-medium text-sm text-ink uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="divide-y divide-border">
                    {perms.map(permission => (
                      <label 
                        key={permission} 
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          selectedRole === 'admin' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-paper-card'
                        }`}
                      >
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-lease-600 bg-paper border-border rounded focus:ring-lease-500 focus:ring-2 cursor-pointer"
                            checked={selectedRole === 'admin' ? true : rolePermissions.includes(permission)}
                            onChange={() => handleTogglePermission(permission)}
                            disabled={selectedRole === 'admin'}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
