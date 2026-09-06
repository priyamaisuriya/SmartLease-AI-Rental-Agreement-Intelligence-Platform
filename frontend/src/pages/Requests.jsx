import React from 'react';
import { Link } from 'react-router-dom';
import { rentalRequests } from '../data/mockData';
import { Search } from 'lucide-react';

const Requests = () => {
  const statusBadge = (status) => {
    const map = { 
      Pending:'bg-warn-50 text-warn-600', 
      Accepted:'bg-good-50 text-good-600', 
      Rejected:'bg-bad-50 text-bad-600'
    };
    const css = map[status] || 'bg-ink/5 text-text-muted';
    return (
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${css}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">My rental requests</h1>
      <p className="mt-1 text-sm text-text-muted">Track the status of properties you've requested to rent.</p>
      
      <div className="mt-6 space-y-4">
        {rentalRequests.length > 0 ? rentalRequests.map(r => (
          <div key={r.id} className="flex flex-col gap-3 rounded-xl2 border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-soft">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-ink">{r.property}</p>
              <p className="mt-1 text-xs text-text-faint">{r.location} · Landlord: {r.landlord}</p>
              <p className="mt-1 text-xs text-text-faint">Requested {r.requestedDate} · Listed rent ₹{r.listedRent.toLocaleString('en-IN')}/mo</p>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(r.status)}
              <Link to={`/properties/${r.propertyId}`} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper">View Details</Link>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-white/60 px-6 py-14 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
              <Search size={20} />
            </span>
            <p className="font-display text-base font-semibold text-ink">No rental requests yet</p>
            <p className="mt-1.5 max-w-sm text-sm text-text-faint">Browse properties and send a request to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
