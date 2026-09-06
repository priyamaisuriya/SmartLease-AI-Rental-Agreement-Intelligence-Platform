import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agreementsData } from '../data/mockData';

const Agreements = () => {
  const navigate = useNavigate();

  const statusBadge = (status) => {
    const map = { 
      Active:'bg-good-50 text-good-600', 
      Expired:'bg-bad-50 text-bad-600', 
      Draft:'bg-ink/5 text-ink-soft', 
      Processing:'bg-lease-50 text-lease-700', 
      Completed:'bg-good-50 text-good-600' 
    };
    const css = map[status] || 'bg-ink/5 text-ink-soft';
    return (
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${css}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My rental agreements</h1>
          <p className="mt-1 text-sm text-ink-soft">Every agreement you've uploaded, linked or independent.</p>
        </div>
        <Link to="/upload" className="rounded-lg bg-lease-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-lease-700">
          + Upload Agreement
        </Link>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {agreementsData.map(a => (
          <div key={a.id} className="rounded-xl2 border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-lease-50 text-[10px] font-display font-bold text-lease-600">
                {a.name.split('.').pop().toUpperCase()}
              </span>
              {riskBadge(a.riskLevel)}
            </div>
            
            <p className="mt-3 truncate font-display text-sm font-semibold text-ink" title={a.name}>{a.name}</p>
            <p className="mt-1 text-xs text-ink-faint">{a.property}</p>
            <p className="mt-1 text-xs text-ink-faint">Uploaded {a.uploadDate}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {statusBadge(a.status)}
              {statusBadge(a.analysisStatus)}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <button onClick={() => navigate('/analysis')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">View</button>
              <button onClick={() => navigate('/analysis')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">Analyze</button>
              <button onClick={() => navigate('/chat')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">Chat with AI</button>
              <button onClick={() => alert('Downloading report…')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agreements;
