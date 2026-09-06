import React from 'react';

const StatusBadge = ({ status }) => {
  let styles = 'bg-ink-100 text-ink-600'; // Default gray
  const s = status?.toLowerCase() || '';

  if (s === 'active' || s === 'accepted' || s === 'available' || s === 'completed' || s === 'success' || s === 'generated' || s === 'low risk') {
    styles = 'bg-good-50 text-good-600 border border-good-500/20';
  } else if (s === 'pending' || s === 'processing' || s === 'medium risk' || s === 'new') {
    styles = 'bg-warn-50 text-warn-600 border border-warn-500/20';
  } else if (s === 'inactive' || s === 'suspended' || s === 'rejected' || s === 'high risk' || s === 'failed') {
    styles = 'bg-bad-50 text-bad-600 border border-bad-500/20';
  } else if (s === 'reviewed') {
    styles = 'bg-signal-50 text-signal-600 border border-signal-400/20';
  } else {
    styles = 'bg-canvas text-ink-soft border border-line';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
