import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { properties } from '../data/mockData';
import { FileText, Search, Settings } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const propertyCard = (p) => (
    <div key={p.id} className="group overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft transition hover:shadow-lift">
      <div className="relative">
        <img src={p.image} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" alt={p.title} />
        <button onClick={(e) => { e.stopPropagation(); /* logic for favorite */ }} className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur ${p.favorite ? 'text-bad-500' : 'text-ink-faint'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={p.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
        </button>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">{p.availability}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-semibold text-ink">{p.title}</p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {p.location}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span className="rounded-full bg-canvas px-2 py-1">{p.bhk}</span>
          <span className="rounded-full bg-canvas px-2 py-1">{p.area}</span>
          <span className="rounded-full bg-canvas px-2 py-1">{p.furnishing}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p><span className="font-display text-base font-semibold text-ink">₹{p.rent.toLocaleString('en-IN')}</span><span className="text-xs text-ink-faint">/mo</span></p>
          <button onClick={() => navigate('/properties')} className="rounded-lg bg-lease-600 px-3 py-2 text-xs font-medium text-white hover:bg-lease-700">View Details</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="active">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div className="fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-lease-50 px-3 py-1 text-xs font-medium text-lease-700">
              <span className="h-1.5 w-1.5 rounded-full bg-lease-500"></span> AI-powered rental intelligence
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] text-ink sm:text-5xl">
              Find your perfect home.<br/>Understand your agreement.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
              Discover rental properties and use AI to understand your rental agreements, identify risks, and never miss important deadlines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties" className="rounded-lg bg-lease-600 px-5 py-3 text-sm font-medium text-white shadow-soft hover:bg-lease-700">Find a Property</Link>
              <Link to="/upload" className="rounded-lg border border-line bg-surface px-5 py-3 text-sm font-medium text-ink hover:bg-canvas">Analyze My Agreement</Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-faint">
              <div><span className="font-display text-xl font-semibold text-ink">2,400+</span><br/>Listed properties</div>
              <div className="h-8 w-px bg-line"></div>
              <div><span className="font-display text-xl font-semibold text-ink">98%</span><br/>Clause accuracy</div>
              <div className="h-8 w-px bg-line"></div>
              <div><span className="font-display text-xl font-semibold text-ink">12k+</span><br/>Agreements analyzed</div>
            </div>
          </div>

          {/* hero mockup */}
          <div className="relative fade-in" style={{ animationDelay: '.1s' }}>
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-signal-100 opacity-60 blur-3xl"></div>
            <div className="absolute -left-6 bottom-0 h-40 w-40 rounded-full bg-lease-100 opacity-70 blur-3xl"></div>
            <div className="relative rounded-xl2 border border-line bg-surface p-4 shadow-lift">
              <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-bad-500/60"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-warn-500/60"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-good-500/60"></span>
                </div>
                <span className="text-xs text-ink-faint">Agreement Analysis</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-line p-3">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop" className="h-20 w-full rounded-md object-cover" alt="Willow Creek Residency" />
                  <p className="mt-2 text-xs font-medium text-ink">Willow Creek Residency</p>
                  <p className="text-[11px] text-ink-faint">₹18,500/mo · Vesu</p>
                </div>
                <div className="rounded-lg border border-line p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-lease-50 text-lease-600 text-xs font-display font-bold">PDF</span>
                    <div>
                      <p className="text-xs font-medium text-ink">Lease Agreement</p>
                      <p className="text-[11px] text-ink-faint">12 pages · Analyzed</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-canvas">
                    <div className="h-1.5 w-4/5 rounded-full bg-lease-500"></div>
                  </div>
                </div>
                <div className="col-span-2 rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-ink">Risk Detection</p>
                    <span className="rounded-full bg-warn-50 px-2 py-0.5 text-[10px] font-medium text-warn-600">Medium Risk</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">Deposit deduction clause lacks a clear damage definition.</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 rounded-lg bg-lease-50 p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lease-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/><path d="M12 8v4l3 3"/></svg>
                  </span>
                  <p className="text-xs text-lease-800">Reminder: Notice deadline in 45 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR PROPERTIES */}
      <section id="popular-properties" className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Popular properties</h2>
            <p className="mt-1.5 text-sm text-ink-soft">Hand-picked rentals available near you right now.</p>
          </div>
          <Link to="/properties" className="hidden shrink-0 text-sm font-medium text-lease-600 hover:text-lease-700 sm:block">View all →</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.slice(0, 4).map(propertyCard)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h2 className="max-w-md font-display text-2xl font-semibold text-ink sm:text-3xl">How SmartLease AI works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="relative rounded-xl2 border border-line p-6">
              <span className="font-display text-3xl font-bold text-lease-200">1</span>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">Find a property</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Search verified listings by location, rent, and amenities that match your life.</p>
            </div>
            <div className="relative rounded-xl2 border border-line p-6">
              <span className="font-display text-3xl font-bold text-lease-200">2</span>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">Manage your rental</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Send requests, track responses, and keep every rental detail in one place.</p>
            </div>
            <div className="relative rounded-xl2 border border-line p-6">
              <span className="font-display text-3xl font-bold text-lease-200">3</span>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">Analyze with AI</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Upload any agreement and get a plain-language breakdown of risks and terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE */}
      <section id="ai-intelligence" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">AI Agreement Intelligence</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">Every clause, date, and number in your lease — explained in plain language, with risks flagged before you sign.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">AI Summary</p><p className="mt-1 text-xs text-ink-faint">Plain-language overview</p></div>
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">Financial Terms</p><p className="mt-1 text-xs text-ink-faint">Rent, deposit, fees</p></div>
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">Risk Detection</p><p className="mt-1 text-xs text-ink-faint">Flagged clauses</p></div>
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">Important Dates</p><p className="mt-1 text-xs text-ink-faint">Never miss a deadline</p></div>
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">Recommendations</p><p className="mt-1 text-xs text-ink-faint">What to do next</p></div>
              <div className="rounded-xl2 border border-line bg-surface p-4"><p className="font-display text-sm font-semibold text-ink">AI Chat</p><p className="mt-1 text-xs text-ink-faint">Ask it anything</p></div>
            </div>
          </div>
          <div className="rounded-xl2 border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-ink">Overall Risk Score</p>
              <span className="rounded-full bg-warn-50 px-2.5 py-1 text-xs font-medium text-warn-600">Medium</span>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E7E9F2" strokeWidth="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#C1811F" strokeWidth="12" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="140" transform="rotate(-90 60 60)"/>
                <text x="60" y="66" textAnchor="middle" fontFamily="Sora" fontSize="22" fontWeight="700" fill="#1E2233">55</text>
              </svg>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-bad-500"></span>1 High risk clause</p>
                <p className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-warn-500"></span>1 Medium risk clause</p>
                <p className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-good-500"></span>1 Low risk clause</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-line bg-lease-600">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Have a rental agreement already?</h2>
          <p className="mt-3 text-sm text-lease-100">Upload it now and get a full AI breakdown in minutes — no property search required.</p>
          <button onClick={() => navigate('/upload')} className="mt-7 rounded-lg bg-white px-6 py-3 text-sm font-medium text-lease-700 shadow-soft hover:bg-lease-50">Analyze Agreement</button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
