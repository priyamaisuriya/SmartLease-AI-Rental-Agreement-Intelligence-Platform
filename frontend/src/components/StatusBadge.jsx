import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Analyzed':
      case 'Active':
      case 'Completed':
      case 'Success':
      case 'Resolved':
        return 'bg-safe-bg text-safe';
      case 'Processing':
      case 'Pending':
      case 'Warning':
      case 'Under Review':
        return 'bg-warn-bg text-warn';
      case 'OCR Failed':
      case 'Failed':
      case 'Error':
      case 'Action Required':
        return 'bg-risk-bg text-risk';
      default:
        return 'bg-line text-ink-soft';
    }
  };

  return (
    <span className={`font-mono text-[10.5px] font-semibold tracking-[0.03em] px-[9px] py-[4px] rounded-[20px] uppercase inline-block ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
