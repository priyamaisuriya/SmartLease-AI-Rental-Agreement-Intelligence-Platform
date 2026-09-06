import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { properties } from '../data/mockData';
import { MapPin, ArrowLeft, Check } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = properties.find(x => x.id === id);
  const [favorite, setFavorite] = useState(p ? p.favorite : false);
  const [requestSent, setRequestSent] = useState(false);

  if (!p) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Property Not Found</h2>
        <button onClick={() => navigate('/properties')} className="mt-4 text-sm font-medium text-lease-600">Back to properties</button>
      </div>
    );
  }

  const handleSendRequest = () => {
    setRequestSent(true);
    // In a real app, this would make an API call to send the request
  };

  return (
    <div className="fade-in pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <img src={p.gallery[0]} className="col-span-2 row-span-2 h-full max-h-96 w-full rounded-xl2 object-cover sm:col-span-2" alt="Primary" />
        {p.gallery.slice(1,3).map((g, i) => (
          <img key={i} src={g} className="h-44 w-full rounded-xl2 object-cover" alt={`Gallery ${i}`} />
        ))}
        {Array.from({ length: Math.max(0, 3 - p.gallery.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="grid h-44 w-full place-items-center rounded-xl2 bg-canvas text-xs text-ink-faint">More photos soon</div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{p.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin size={14} />
                {p.location}
              </p>
            </div>
            <p className="text-right">
              <span className="font-display text-2xl font-semibold text-ink">₹{p.rent.toLocaleString('en-IN')}</span>
              <span className="text-sm text-ink-faint">/mo listed rent</span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-faint">BHK</p><p className="mt-1 text-sm font-medium text-ink">{p.bhk}</p></div>
            <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-faint">Area</p><p className="mt-1 text-sm font-medium text-ink">{p.area}</p></div>
            <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-faint">Furnishing</p><p className="mt-1 text-sm font-medium text-ink">{p.furnishing}</p></div>
            <div className="rounded-lg border border-line p-3"><p className="text-xs text-ink-faint">Available from</p><p className="mt-1 text-sm font-medium text-ink">{p.availableFrom}</p></div>
          </div>

          <div className="mt-6">
            <p className="font-display text-base font-semibold text-ink">Description</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.description}</p>
          </div>

          <div className="mt-6">
            <p className="font-display text-base font-semibold text-ink">Amenities</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.amenities.map(a => (
                <div key={a} className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-ink-soft">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-lease-50 text-lease-600">
                    <Check size={14} />
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
            <p className="font-display text-base font-semibold text-ink">Rental information</p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><p className="text-xs text-ink-faint">Listed Rent</p><p className="mt-1 text-sm font-semibold text-ink">₹{p.rent.toLocaleString('en-IN')}/mo</p></div>
              <div><p className="text-xs text-ink-faint">Security Deposit</p><p className="mt-1 text-sm font-semibold text-ink">₹{p.deposit.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-ink-faint">Availability</p><p className="mt-1 text-sm font-semibold text-ink">{p.availability}</p></div>
              <div><p className="text-xs text-ink-faint">Property Type</p><p className="mt-1 text-sm font-semibold text-ink">{p.type}</p></div>
            </div>
            <p className="mt-3 text-xs text-ink-faint">Listed rent reflects the advertised price and is not the final contractual rent, which will be confirmed in your signed agreement.</p>
          </div>
        </div>

        <aside className="h-fit rounded-xl2 border border-line bg-surface p-5 shadow-soft lg:sticky lg:top-24">
          <p className="font-display text-base font-semibold text-ink">Interested in this property?</p>
          <p className="mt-1.5 text-sm text-ink-soft">Landlord: {p.landlord}</p>
          
          <button 
            onClick={handleSendRequest}
            disabled={requestSent}
            className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-medium shadow-soft transition-colors ${requestSent ? 'bg-good-50 text-good-600' : 'bg-lease-600 text-white hover:bg-lease-700'}`}
          >
            {requestSent ? 'Request Sent' : 'Send Rental Request'}
          </button>
          
          <button 
            onClick={() => setFavorite(!favorite)}
            className="mt-2 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
          >
            {favorite ? '♥ Saved' : '♡ Save property'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetails;
