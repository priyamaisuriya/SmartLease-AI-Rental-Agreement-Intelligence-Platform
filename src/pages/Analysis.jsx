import React from 'react';
import { useNavigate } from 'react-router-dom';
import { financialTerms, leaseDetails, importantClauses, risks, recommendations } from '../data/mockData';

const Analysis = () => {
  const navigate = useNavigate();

  const riskBadge = (level) => {
    if (!level) return null;
    const map = { 
      Low:'bg-good-50 text-good-600 border-good-500/20', 
      Medium:'bg-warn-50 text-warn-600 border-warn-500/20', 
      High:'bg-bad-50 text-bad-600 border-bad-500/20' 
    };
    return (
      <span className={`inline-flex items-center rounded-full border font-medium px-2.5 py-1 text-xs ${map[level]}`}>
        {level} Risk
      </span>
    );
  };

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Cedar Heights — Lease Agreement</h1>
          <p className="mt-1 text-sm text-ink-soft">Cedar Heights, Pal · Analyzed 2 Sep 2026</p>
        </div>
        <button onClick={() => navigate('/chat')} className="rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-signal-600">
          Ask AI about this agreement
        </button>
      </div>

      {/* overall risk */}
      <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <svg width="128" height="128" viewBox="0 0 120 120" className="shrink-0 ring-anim">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#E7E9F2" strokeWidth="12"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#C1811F" strokeWidth="12" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="140" transform="rotate(-90 60 60)"/>
            <text x="60" y="55" textAnchor="middle" fontFamily="Sora" fontSize="22" fontWeight="700" fill="#1E2233">55</text>
            <text x="60" y="72" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#8A8FA3">out of 100</text>
          </svg>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-semibold text-ink">Overall Risk: Medium</p>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              This agreement is broadly standard, but one clause around deposit deductions is ambiguous and worth clarifying before you sign or renew.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bad-500"></span>1 High</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warn-500"></span>1 Medium</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-good-500"></span>1 Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI summary */}
      <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
        <p className="font-display text-base font-semibold text-ink">AI summary</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          This is a 12-month lease for Cedar Heights starting 1 Sep 2026, with a 6-month lock-in and a 60-day notice period after that. Rent is ₹25,500/month with a refundable deposit of ₹76,500. The landlord can raise rent by up to 7% at renewal. One clause about deposit deductions isn't clearly defined, so it's worth getting written clarification before you sign.
        </p>
      </div>

      {/* financial terms */}
      <div className="mt-6">
        <p className="font-display text-base font-semibold text-ink">Financial terms</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {financialTerms.map((f, i) => (
            <div key={i} className="rounded-xl2 border border-line bg-surface p-4">
              <p className="text-xs text-ink-faint">{f.label}</p>
              <p className="mt-1.5 font-display text-sm font-semibold text-ink">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* lease details */}
      <div className="mt-6">
        <p className="font-display text-base font-semibold text-ink">Lease details</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {leaseDetails.map((f, i) => (
            <div key={i} className="rounded-xl2 border border-line bg-surface p-4">
              <p className="text-xs text-ink-faint">{f.label}</p>
              <p className="mt-1.5 font-display text-sm font-semibold text-ink">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* important clauses */}
      <div className="mt-6">
        <p className="font-display text-base font-semibold text-ink">Important clauses</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {importantClauses.map((c, i) => (
            <div key={i} className="rounded-xl2 border border-line bg-surface p-4">
              <p className="font-display text-sm font-semibold text-ink">{c.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* risk detection */}
      <div className="mt-6">
        <p className="font-display text-base font-semibold text-ink">Risk detection</p>
        <div className="mt-3 space-y-4">
          {risks.map((r, i) => (
            <div key={i} className="rounded-xl2 border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-ink">{r.title}</p>
                {riskBadge(r.level)}
              </div>
              <p className="mt-2 text-sm text-ink-soft">{r.explanation}</p>
              <p className="mt-2 text-xs text-ink-faint"><span className="font-medium text-ink">Why it matters:</span> {r.why}</p>
              <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-soft"><span className="font-medium text-ink">Suggested action:</span> {r.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* important dates */}
      <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
        <p className="font-display text-base font-semibold text-ink">Important dates</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-lease-600">Agreement start</p>
            <p className="mt-1.5 font-display text-sm font-semibold text-ink">1 Sep 2026</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-lease-600">Rent due</p>
            <p className="mt-1.5 font-display text-sm font-semibold text-ink">5th of each month</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-warn-600">Notice deadline</p>
            <p className="mt-1.5 font-display text-sm font-semibold text-ink">1 Jul 2027</p>
          </div>
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-bad-600">Agreement expiry</p>
            <p className="mt-1.5 font-display text-sm font-semibold text-ink">31 Aug 2027</p>
          </div>
        </div>
      </div>

      {/* recommendations */}
      <div className="mt-6 rounded-xl2 border border-line bg-lease-50/60 p-6">
        <p className="font-display text-base font-semibold text-ink">AI recommendations</p>
        <ul className="mt-3 space-y-2.5">
          {recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lease-600 text-white">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Analysis;
