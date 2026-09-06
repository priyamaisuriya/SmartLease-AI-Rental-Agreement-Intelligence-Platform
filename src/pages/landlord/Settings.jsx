import React from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Account Settings</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-line rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-ink mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">Rental Request Notifications</div>
                <div className="text-xs text-ink-faint">Get notified when a new tenant applies</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">Agreement Alerts</div>
                <div className="text-xs text-ink-faint">Get notified on agreement expiry or AI analysis completion</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-ink mb-4">Security</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full max-w-md px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full max-w-md px-3 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
