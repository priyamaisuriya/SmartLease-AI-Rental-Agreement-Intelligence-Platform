import React from 'react';
import { reports } from '../data/mockData';
import { FileText } from 'lucide-react';

const Reports = () => {
  const riskBadge = (level) => {
    if (!level) return null;
    const map = { 
      Low:'bg-good-50 text-good-600 border-good-500/20', 
      Medium:'bg-warn-50 text-warn-600 border-warn-500/20', 
      High:'bg-bad-50 text-bad-600 border-bad-500/20' 
    };
    return (
      <span className={`inline-flex items-center rounded-full border font-medium px-2 py-0.5 text-[11px] ${map[level]}`}>
        {level} Risk
      </span>
    );
  };

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
      <p className="mt-1 text-sm text-text-muted">Download and review your rental and agreement history.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl2 border border-border bg-white p-6">
          <p className="font-display text-sm font-semibold text-ink">Rental history</p>
          <p className="mt-2 text-sm text-text-muted">1 active rental, 0 past rentals recorded.</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-6">
          <p className="font-display text-sm font-semibold text-ink">Request history</p>
          <p className="mt-2 text-sm text-text-muted">3 requests sent · 1 accepted, 1 pending, 1 rejected.</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-6">
          <p className="font-display text-sm font-semibold text-ink">Agreement analysis reports</p>
          <p className="mt-2 text-sm text-text-muted">2 reports generated across your agreements.</p>
        </div>
      </div>

      <p className="mt-8 font-display text-base font-semibold text-ink">Agreement analysis reports</p>
      <div className="mt-4 space-y-3">
        {reports.map(r => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-lease-50 text-lease-600">
                <FileText size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="text-xs text-text-faint">{r.agreement} · Generated {r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {riskBadge(r.riskLevel)}
              <button onClick={() => alert(`Downloading ${r.name}`)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-paper">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
