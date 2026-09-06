import React from 'react';

const ChartCard = ({ title, action, children }) => {
  return (
    <div className="bg-white p-[24px] rounded-[8px] shadow-sm border border-border flex flex-col h-full hover:border-gold transition-colors">
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="font-semibold text-ink text-[16px] m-0">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
