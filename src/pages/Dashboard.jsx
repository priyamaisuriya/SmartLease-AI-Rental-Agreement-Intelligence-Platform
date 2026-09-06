import React from 'react';
import { Link } from 'react-router-dom';
import { rentalRequests, reminders } from '../data/mockData';
import { Home, HelpCircle, FileText, Bell, Search, Upload } from 'lucide-react';

const Dashboard = () => {
  const statusBadge = (status) => {
    const map = { 
      Pending:'bg-warn-50 text-warn-600', 
      Accepted:'bg-good-50 text-good-600', 
      Rejected:'bg-bad-50 text-bad-600', 
      Active:'bg-good-50 text-good-600', 
      Signed:'bg-good-50 text-good-600', 
      Completed:'bg-good-50 text-good-600', 
      Expired:'bg-bad-50 text-bad-600', 
      Draft:'bg-ink/5 text-ink-soft', 
      Processing:'bg-lease-50 text-lease-700', 
      Upcoming:'bg-lease-50 text-lease-700' 
    };
    const css = map[status] || 'bg-ink/5 text-ink-soft';
    return (
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${css}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">Good morning, Ananya</h1>
      <p className="mt-1 text-sm text-ink-soft">Here's an overview of your rental activity.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl2 border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-soft">Active Rental</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lease-50 text-lease-600">
              <Home size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">1</p>
          <p className="mt-1 text-xs text-ink-faint">Cedar Heights, Pal</p>
        </div>
        <div className="rounded-xl2 border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-soft">Pending Requests</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-warn-50 text-warn-600">
              <HelpCircle size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">1</p>
          <p className="mt-1 text-xs text-ink-faint">Awaiting landlord response</p>
        </div>
        <div className="rounded-xl2 border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-soft">My Agreements</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-signal-50 text-signal-600">
              <FileText size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">3</p>
          <p className="mt-1 text-xs text-ink-faint">1 needs review</p>
        </div>
        <div className="rounded-xl2 border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-soft">Upcoming Reminders</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-good-50 text-good-600">
              <Bell size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">2</p>
          <p className="mt-1 text-xs text-ink-faint">Next: Rent due 5 Oct</p>
        </div>
      </div>

      {/* quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-lease-50 text-lease-600">
            <Search size={20} />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-ink">Find a property</p>
          <p className="mt-1.5 text-sm text-ink-soft">Explore available rental properties.</p>
          <Link to="/properties" className="mt-4 inline-block rounded-lg bg-lease-600 px-4 py-2 text-sm font-medium text-white hover:bg-lease-700">Browse Properties</Link>
        </div>
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-signal-50 text-signal-600">
            <Upload size={20} />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-ink">Analyze agreement</p>
          <p className="mt-1.5 text-sm text-ink-soft">Upload your rental agreement and let AI explain it.</p>
          <Link to="/upload" className="mt-4 inline-block rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-white hover:bg-signal-600">Upload Agreement</Link>
        </div>
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-good-50 text-good-600">
            <Home size={20} />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-ink">My rentals</p>
          <p className="mt-1.5 text-sm text-ink-soft">Manage your current rental information.</p>
          <Link to="/rentals" className="mt-4 inline-block rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-canvas">View Rentals</Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* recent requests */}
        <div className="rounded-xl2 border border-line bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-semibold text-ink">Recent rental requests</p>
            <Link to="/requests" className="text-sm font-medium text-lease-600 hover:text-lease-700">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {rentalRequests.slice(0,3).map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{r.property}</p>
                  <p className="text-xs text-ink-faint">{r.landlord} · ₹{r.listedRent.toLocaleString('en-IN')}/mo</p>
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </div>
        </div>
        {/* upcoming reminders */}
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-semibold text-ink">Upcoming reminders</p>
            <Link to="/reminders" className="text-sm font-medium text-lease-600 hover:text-lease-700">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {reminders.filter(r => r.status === 'Upcoming').slice(0,3).map(r => (
              <div key={r.id} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lease-50 text-lease-600">
                  <Bell size={14} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-ink-faint">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
