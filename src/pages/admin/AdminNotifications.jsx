import React from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'New property registered: Sunset Apartments 4B.', time: '1 hour ago', read: false },
  { id: 2, title: 'System audit report generated successfully.', time: '4 hours ago', read: false },
  { id: 3, title: 'New user signup: John Smith (Landlord).', time: '1 day ago', read: true },
  { id: 4, title: 'High risk detected in recent agreement upload.', time: '2 days ago', read: true },
];

const AdminNotifications = () => {
  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">System Notifications</h1>
          <p className="text-ink-soft mt-1">Platform-wide alerts and updates.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-lease-600 hover:text-lease-700">
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm divide-y divide-line">
        {mockNotifications.map(notif => (
          <div key={notif.id} className={`p-6 flex items-start gap-4 transition-colors ${!notif.read ? 'bg-lease-50/30' : 'hover:bg-canvas/50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-lease-100 text-lease-600' : 'bg-canvas text-ink-soft border border-line'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!notif.read ? 'font-semibold text-ink' : 'text-ink'}`}>{notif.title}</p>
              <p className="text-xs text-ink-soft mt-1">{notif.time}</p>
            </div>
            {!notif.read && (
              <button className="p-2 text-ink-faint hover:text-lease-600 transition-colors" title="Mark as read">
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;
