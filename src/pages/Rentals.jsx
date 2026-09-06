import React from 'react';
import { Link } from 'react-router-dom';
import { myRentals } from '../data/mockData';
import { Home } from 'lucide-react';

const Rentals = () => {
  const statusBadge = (status) => {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-good-50 text-good-600">
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">My rentals</h1>
      <p className="mt-1 text-sm text-ink-soft">Your current rental at a glance.</p>
      
      <div className="mt-6 space-y-6">
        {myRentals.length > 0 ? myRentals.map(r => (
          <div key={r.id} className="overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
              <img src={r.image} className="h-52 w-full object-cover lg:h-full" alt={r.property} />
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">{r.property}</p>
                    <p className="mt-1 text-sm text-ink-faint">{r.address}</p>
                  </div>
                  {statusBadge(r.agreementStatus)}
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div><p className="text-xs text-ink-faint">Landlord</p><p className="mt-1 text-sm font-medium text-ink">{r.landlord}</p></div>
                  <div><p className="text-xs text-ink-faint">Start Date</p><p className="mt-1 text-sm font-medium text-ink">{r.startDate}</p></div>
                  <div><p className="text-xs text-ink-faint">Contractual Rent</p><p className="mt-1 text-sm font-medium text-ink">₹{r.contractualRent.toLocaleString('en-IN')}/mo</p></div>
                  <div><p className="text-xs text-ink-faint">Deposit</p><p className="mt-1 text-sm font-medium text-ink">₹{r.deposit.toLocaleString('en-IN')}</p></div>
                </div>
                
                <p className="mt-4 rounded-lg bg-lease-50 px-3 py-2 text-xs text-lease-700">
                  Contractual rent (above) reflects your signed agreement, and may differ from the property's original listed rent.
                </p>
                
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/properties/${r.propertyId}`} className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-canvas">View Property</Link>
                  <Link to="/agreements" className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-canvas">View Agreement</Link>
                  <Link to="/analysis" className="rounded-lg bg-lease-600 px-3 py-2 text-xs font-medium text-white hover:bg-lease-700">Analyze Agreement</Link>
                  <button onClick={() => alert('Opening chat with '+r.landlord)} className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-canvas">Contact Landlord</button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
              <Home size={20} />
            </span>
            <p className="font-display text-base font-semibold text-ink">No active rentals</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink-faint">Once a rental request is accepted, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rentals;
