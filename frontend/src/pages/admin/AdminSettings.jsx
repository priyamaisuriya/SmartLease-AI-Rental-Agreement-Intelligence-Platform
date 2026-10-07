import React, { useState } from 'react';
import { Save } from 'lucide-react';

const DEFAULT_SETTINGS = {
  siteName: 'SmartLease AI',
  contactEmail: 'admin@smartlease.ai',
  aiModel: 'Gemini Pro (Active)',
  autoAnalyze: true,
  sessionTimeout: 60,
  require2FA: true
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset platform settings to default?")) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Platform Settings</h1>
          <p className="text-text-muted mt-1">Configure global platform preferences and system options.</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Site Name</label>
                <input type="text" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Contact Email</label>
                <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">AI Engine Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Primary AI Model</label>
                <select value={settings.aiModel} onChange={(e) => setSettings({...settings, aiModel: e.target.value})} className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500">
                  <option>Gemini Pro (Active)</option>
                  <option>GPT-4o</option>
                  <option>Claude 3.5 Sonnet</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">Auto-Analyze Uploads</div>
                  <div className="text-xs text-text-faint">Automatically analyze agreements upon upload</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Session Timeout (Minutes)</label>
                <input type="number" value={settings.sessionTimeout} onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})} className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">Require 2FA for Admins</div>
                  <div className="text-xs text-text-faint">Enforce two-factor authentication</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.require2FA} onChange={() => setSettings({...settings, require2FA: !settings.require2FA})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
