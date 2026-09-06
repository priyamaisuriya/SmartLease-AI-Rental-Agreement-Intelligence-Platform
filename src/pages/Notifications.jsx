import React, { useState } from 'react';
import { notifications as initialNotifications } from '../data/mockData';

const Notifications = () => {
  const [notifs, setNotifs] = useState(initialNotifications);

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink-soft">Updates on your requests, agreements, and reminders.</p>
        </div>
        <button onClick={markAllRead} className="text-sm font-medium text-lease-600 hover:text-lease-700">
          Mark all as read
        </button>
      </div>
      
      <div className="mt-6 space-y-3">
        {notifs.map(n => (
          <div 
            key={n.id} 
            onClick={() => markRead(n.id)} 
            className={`flex cursor-pointer items-start gap-3 rounded-xl2 border border-line p-4 ${n.read ? 'bg-surface' : 'bg-lease-50/50'}`}
          >
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-lease-600'}`}></span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${n.read ? 'text-ink-soft' : 'font-medium text-ink'}`}>{n.message}</p>
              <p className="mt-1 text-xs text-ink-faint">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
