import React from 'react';
import { Link } from 'react-router-dom';
import { landlordStats, landlordReminders, landlordRentalRequests } from '../../data/landlordMockData';

const QuickActionCard = ({ title, desc, buttonText, icon, to }) => (
  <div className="bg-white border border-border p-[24px] rounded-[8px] flex flex-col hover:border-gold-soft transition-colors group cursor-pointer">
    <div className="w-[42px] h-[42px] rounded-[6px] border border-border bg-paper flex items-center justify-center font-mono text-[18px] mb-[18px] text-text-muted group-hover:bg-gold/10 group-hover:border-gold group-hover:text-gold-deep transition-colors">
      {icon}
    </div>
    <h3 className="font-serif font-medium text-[17px] mb-[6px] text-ink">{title}</h3>
    <p className="text-[13.5px] text-text-muted flex-1 mb-[18px] leading-relaxed">{desc}</p>
    <Link to={to} className="font-semibold text-[13px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors">
      {buttonText}
    </Link>
  </div>
);

const LandlordDashboard = () => {
  const kpis = {
    totalProperties: landlordStats.totalProperties.value,
    availableProperties: landlordStats.availableProperties.value,
    activeTenants: landlordStats.activeTenants.value,
  };
  
  const riskAlerts = [
    { id: 1, type: 'Maintenance Request', property: 'Lakeview Residency', details: 'Water leakage reported' },
    { id: 2, type: 'Late Rent', property: 'Sunset Apartments 4B', details: '3 days overdue' }
  ];

  const upcomingReminders = landlordReminders.map(rem => ({
    id: rem.id,
    title: rem.title,
    property: rem.property,
    dueDate: rem.date
  }));

  const recentRequests = landlordRentalRequests.filter(req => req.status === 'Pending');

  return (
    <div className="fade-in space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[8px] mb-[26px] overflow-hidden">
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Total Properties</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{kpis.totalProperties}</div>
          <span className="font-mono text-[11.5px] text-text-faint">{kpis.availableProperties} available</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Total Tenants</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{kpis.activeTenants}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Active leases</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Pending Requests</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{recentRequests.length}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Needs review</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Flagged Risks</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{riskAlerts.length}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Across agreements</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[26px] mb-[26px] items-start">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
          <QuickActionCard 
            title="Add Property" desc="List a new residential or commercial property." 
            buttonText="Create Listing" icon="+" to="/landlord/properties/add"
          />
          <QuickActionCard 
            title="Rental Requests" desc="Review new tenant applications." 
            buttonText="View Requests" icon="◫" to="/landlord/rental-requests"
          />
          <QuickActionCard 
            title="Agreements" desc="Analyze lease contracts for risks." 
            buttonText="View Agreements" icon="≡" to="/landlord/agreements"
          />
          <QuickActionCard 
            title="Set Reminder" desc="Create deadlines for rent or renewals." 
            buttonText="Add Reminder" icon="⏰" to="/landlord/reminders"
          />
        </div>

        {/* Risk Alerts */}
        <div className="bg-white border border-border rounded-[8px]">
          <div className="p-[20px] px-[24px] border-b border-border">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">Risk alerts</h3>
          </div>
          <div>
            {riskAlerts.map(alert => (
              <div key={alert.id} className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start">
                <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">!</span>
                <div>
                  <b className="text-[14px] font-semibold text-ink block mb-[4px]">{alert.type}</b>
                  <p className="text-[13px] text-text-muted m-0 leading-relaxed">{alert.property} · {alert.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white border border-border rounded-[8px]">
        <div className="p-[20px] px-[24px] border-b border-border">
          <h3 className="font-serif font-medium text-[17px] text-ink m-0">Upcoming reminders</h3>
        </div>
        <div>
          {upcomingReminders.map(rem => (
            <div key={rem.id} className="flex justify-between items-center p-[16px] px-[24px] border-b border-border last:border-b-0">
              <div className="text-[14px] font-medium text-ink">{rem.title} — {rem.property}</div>
              <span className="font-mono text-[11.5px] font-medium bg-paper border border-border text-text-muted px-[10px] py-[5px] rounded-[4px] whitespace-nowrap">
                {rem.dueDate}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LandlordDashboard;
