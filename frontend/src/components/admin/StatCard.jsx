import React from 'react';

const StatCard = ({ title, value, trend, isPositive, icon: Icon, desc }) => {
  return (
    <div className="bg-white p-6 rounded-[8px] shadow-sm border border-border hover:border-gold transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-ink mb-[6px]">{title}</p>
          <h3 className="text-[26px] font-bold text-ink">{value}</h3>
        </div>
        <div className="text-ink-dark flex items-center justify-center">
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="mt-[18px] flex items-center gap-2 text-[13px]">
        {trend && (
          <span className={`font-semibold ${isPositive ? 'text-[#10B981]' : 'text-risk-red'}`}>
            {trend}
          </span>
        )}
        <span className="text-text-muted">{desc}</span>
      </div>
    </div>
  );
};

export default StatCard;
