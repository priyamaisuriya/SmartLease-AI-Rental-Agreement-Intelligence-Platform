import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Analyzed':
      case 'Active':
      case 'Completed':
      case 'Success':
      case 'Resolved':
        return 'bg-[#4C7A5E]/10 text-[#4C7A5E]';
      case 'Processing':
      case 'Pending':
      case 'Warning':
      case 'Under Review':
        return 'bg-[#B8863B]/10 text-[#B8863B]';
      case 'OCR Failed':
      case 'Failed':
      case 'Error':
      case 'Action Required':
      case 'Inactive':
        return 'bg-risk-red-bg text-risk-red';
      default:
        return 'bg-border text-text-muted';
    }
  };

  return (
    <span className={`font-mono text-[10.5px] font-semibold tracking-[0.03em] px-[9px] py-[4px] rounded-[20px] uppercase inline-block ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
