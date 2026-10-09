import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';

const DEFAULT_SETTINGS = {
  siteName: 'SmartLease AI',
  contactEmail: '',
  sessionTimeoutMinutes: 300,
};

const inputCls =
  'w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500';

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [aiModel, setAiModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/settings');
        const { aiModel: model, ...rest } = res.data;
        setSettings({ ...DEFAULT_SETTINGS, ...rest });
        setAiModel(model || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (field) => (e) => {
    const value = e.target.type === 'number' ? e.target.value : e.target.value;
    setSettings((s) => ({ ...s, [field]: value }));
    setSaved(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset the form to the default values? Nothing is saved until you click Save Changes.')) {
      setSettings(DEFAULT_SETTINGS);
      setSaved(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await api.put('/admin/settings', {
        siteName: settings.siteName,
        contactEmail: settings.contactEmail,
        sessionTimeoutMinutes: Number(settings.sessionTimeoutMinutes),
      });
      const { aiModel: model, message, ...rest } = res.data;
      setSettings({ ...DEFAULT_SETTINGS, ...rest });
      setAiModel(model || aiModel);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted fade-in">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Platform Settings</h1>
          <p className="text-text-muted mt-1">Configure global platform preferences.</p>
        </div>

        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium mr-2">Saved!</span>}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-paper border border-border text-ink rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {error && <div className="p-3 text-sm rounded-lg text-risk-red bg-risk-red-bg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-ink mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Site Name</label>
              <input type="text" maxLength={60} value={settings.siteName} onChange={update('siteName')} className={inputCls} />
              <p className="text-xs text-text-faint mt-1">Used as the sender name on emails (verification, invoices).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Contact Email</label>
              <input type="email" value={settings.contactEmail} onChange={update('contactEmail')} className={inputCls} placeholder="support@example.com" />
              <p className="text-xs text-text-faint mt-1">Replies to platform emails are sent here. Leave empty for none.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">Security</h3>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Session Timeout (Minutes)</label>
              <input
                type="number"
                min={15}
                max={1440}
                value={settings.sessionTimeoutMinutes}
                onChange={update('sessionTimeoutMinutes')}
                className={inputCls}
              />
              <p className="text-xs text-text-faint mt-1">
                Between 15 and 1440. Applies to logins made after saving; existing sessions keep their original expiry.
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">AI Engine</h3>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Active Model</label>
              <input type="text" value={aiModel || 'Not configured'} readOnly className={`${inputCls} opacity-70`} />
              <p className="text-xs text-text-faint mt-1">Set on the server with the GEMINI_MODEL environment variable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
