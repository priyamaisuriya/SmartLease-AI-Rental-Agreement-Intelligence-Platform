import React from 'react';

const ChartCard = ({ title, action, children }) => {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-line flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-ink">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
