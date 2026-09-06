import React from 'react';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Platform Settings</h1>
          <p className="text-ink-soft mt-1">Configure global platform preferences and system options.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-surface border border-line rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">Site Name</label>
                <input type="text" defaultValue="SmartLease AI" className="w-full px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">Contact Email</label>
                <input type="email" defaultValue="admin@smartlease.ai" className="w-full px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">AI Engine Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">Primary AI Model</label>
                <select className="w-full px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500">
                  <option>Gemini Pro (Active)</option>
                  <option>GPT-4o</option>
                  <option>Claude 3.5 Sonnet</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">Auto-Analyze Uploads</div>
                  <div className="text-xs text-ink-faint">Automatically analyze agreements upon upload</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-line rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-ink mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1">Session Timeout (Minutes)</label>
                <input type="number" defaultValue="60" className="w-full px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">Require 2FA for Admins</div>
                  <div className="text-xs text-ink-faint">Enforce two-factor authentication</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
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
