import React from 'react';

const StatCard = ({ title, value, trend, isPositive, icon: Icon, desc }) => {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-soft mb-1">{title}</p>
          <h3 className="text-2xl font-display font-bold text-ink">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-lease-50 text-lease-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm">
        {trend && (
          <span className={`font-medium ${isPositive ? 'text-good-600' : 'text-bad-600'}`}>
            {trend}
          </span>
        )}
        <span className="text-ink-faint">{desc}</span>
      </div>
    </div>
  );
};

export default StatCard;
