import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';

const NOTIFICATION_SETTINGS_KEY =
  'smartlease_landlord_notification_settings';

const DEFAULT_SETTINGS = {
  rentalRequests: true,
  agreementAlerts: true,
};

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(
        NOTIFICATION_SETTINGS_KEY
      );

      return saved
        ? {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saved, setSaved] = useState(false);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  const handleNotificationChange = (field) => {
    setSettings((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSave = () => {
    localStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">
          Account Settings
        </h1>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Notification preferences saved successfully.
        </div>
      )}

      <div className="space-y-6">

        {/* NOTIFICATION PREFERENCES */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-ink mb-4">
            Notification Preferences
          </h3>

          <div className="space-y-4">

            {/* RENTAL REQUESTS */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  Rental Request Notifications
                </div>

                <div className="text-xs text-text-faint">
                  Get notified when a new tenant applies
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rentalRequests}
                  onChange={() =>
                    handleNotificationChange(
                      'rentalRequests'
                    )
                  }
                  className="sr-only peer"
                />

                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
              </label>
            </div>

            {/* AGREEMENT ALERTS */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  Agreement Alerts
                </div>

                <div className="text-xs text-text-faint">
                  Get notified on agreement expiry or AI analysis completion
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.agreementAlerts}
                  onChange={() =>
                    handleNotificationChange(
                      'agreementAlerts'
                    )
                  }
                  className="sr-only peer"
                />

                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lease-600"></div>
              </label>
            </div>

          </div>
        </div>

        {/* SECURITY */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-ink">
                Security
              </h3>

              <p className="text-xs text-text-faint mt-1">
                Password changes will be available when the
                backend password-management API is implemented.
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {/* CURRENT PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Current Password
              </label>

              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) =>
                  setSecurity((current) => ({
                    ...current,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="••••••••"
                disabled
                className="w-full max-w-md px-3 py-2 bg-paper border border-border rounded-lg text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                New Password
              </label>

              <input
                type="password"
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity((current) => ({
                    ...current,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="••••••••"
                disabled
                className="w-full max-w-md px-3 py-2 bg-paper border border-border rounded-lg text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            <p className="text-xs text-text-faint">
              Password management is currently disabled because
              there is no password-change endpoint in the SmartLease
              backend yet.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;