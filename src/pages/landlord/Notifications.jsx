import React from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'New rental request received.', time: '2 hours ago', read: false },
  { id: 2, title: 'Agreement analysis for "Sunset_Apt_Lease_2026" is complete.', time: '5 hours ago', read: false },
  { id: 3, title: 'Rent reminder for Sunset Apartments 4B is due tomorrow.', time: '1 day ago', read: true },
  { id: 4, title: 'Tenant Neha Gupta accepted the rental request.', time: '2 days ago', read: true },
];

const Notifications = () => {
  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Notifications</h1>
          <p className="text-ink-soft mt-1">Stay updated on your properties and agreements.</p>
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

export default Notifications;
