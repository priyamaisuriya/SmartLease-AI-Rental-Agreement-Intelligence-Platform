import React from 'react';
import { Download, FileText, TrendingUp, Building, Users } from 'lucide-react';

const ReportCard = ({ title, desc, icon: Icon, date }) => (
  <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-full bg-lease-50 text-lease-600 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-lg text-ink">{title}</h3>
    <p className="text-sm text-text-muted mt-1 flex-1">{desc}</p>
    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
      <span className="text-xs text-text-faint">Generated: {date}</span>
      <button className="flex items-center gap-1 text-sm font-medium text-lease-600 hover:text-lease-700">
        <Download className="w-4 h-4" /> Download
      </button>
    </div>
  </div>
);

const Reports = () => {
  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Rental Reports</h1>
          <p className="text-text-muted mt-1">Export data on property occupancy, rental income, and agreements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Q3 2026 Financial Summary" 
          desc="Detailed breakdown of rental income, maintenance costs, and security deposits." 
          icon={TrendingUp} 
          date="Oct 1, 2026" 
        />
        <ReportCard 
          title="Property Occupancy Report" 
          desc="Overview of vacant vs rented properties across your portfolio." 
          icon={Building} 
          date="Sep 28, 2026" 
        />
        <ReportCard 
          title="Tenant Roster" 
          desc="Complete list of all active tenants with contact and agreement details." 
          icon={Users} 
          date="Sep 15, 2026" 
        />
        <ReportCard 
          title="Agreement Risk Analysis" 
          desc="Aggregated risk scores and flagged clauses across all analyzed agreements." 
          icon={FileText} 
          date="Sep 10, 2026" 
        />
      </div>
    </div>
  );
};

export default Reports;
