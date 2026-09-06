import React, { useState } from 'react';

const Profile = () => {
  const [prefs, setPrefs] = useState([
    { id: 1, label:'Email Notifications', desc:'Get updates about your account by email', on:true },
    { id: 2, label:'Rental Request Notifications', desc:'Know when a landlord responds to your request', on:true },
    { id: 3, label:'Agreement Reminders', desc:'Reminders for rent, notice periods, and renewals', on:true },
    { id: 4, label:'AI Analysis Notifications', desc:'Get notified when an analysis finishes processing', on:false },
  ]);

  const togglePref = (id) => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, on: !p.on } : p));
  };

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">Profile & settings</h1>
      <p className="mt-1 text-sm text-text-muted">Manage your account details and preferences.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* personal info */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">Personal information</p>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-signal-100 font-display text-lg font-semibold text-signal-600">AR</span>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper">Change photo</button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-text-muted">Full name</label>
                <input defaultValue="Ananya Rao" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">Email</label>
                <input defaultValue="ananya.rao@example.com" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">Phone</label>
                <input defaultValue="+91 98765 43210" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink focus:outline-none" />
              </div>
            </div>
            <button className="mt-5 rounded-lg bg-lease-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-lease-700">Save changes</button>
          </div>

          {/* account security */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">Account security</p>
            <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium text-ink">Password</p>
                <p className="text-xs text-text-faint">Last changed 3 months ago</p>
              </div>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper">Change password</button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Login sessions</p>
                <p className="text-xs text-text-faint">2 active sessions</p>
              </div>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper">Manage</button>
            </div>
          </div>

          {/* notification preferences */}
          <div className="rounded-xl2 border border-border bg-white p-6">
            <p className="font-display text-base font-semibold text-ink">Notification preferences</p>
            <div className="mt-4 space-y-4">
              {prefs.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{p.label}</p>
                    <p className="text-xs text-text-faint">{p.desc}</p>
                  </div>
                  <button 
                    onClick={() => togglePref(p.id)} 
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${p.on ? 'bg-lease-600' : 'bg-border'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.on ? 'translate-x-4' : ''}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* account */}
        <div className="h-fit rounded-xl2 border border-border bg-white p-6">
          <p className="font-display text-base font-semibold text-ink">Account</p>
          <button className="mt-4 w-full rounded-lg border border-border px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper">Log out</button>
          <button className="mt-3 w-full rounded-lg border border-bad-500/20 bg-bad-50 px-4 py-2.5 text-left text-sm font-medium text-bad-600 hover:bg-bad-50">Delete account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
