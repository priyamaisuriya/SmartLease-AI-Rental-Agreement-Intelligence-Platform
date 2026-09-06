import React from 'react';
import { Link } from 'react-router-dom';
import { adminStats, recentActivity as mockRecentActivity } from '../../data/adminMockData';

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

const AdminDashboard = () => {
  const kpis = {
    totalUsers: adminStats.totalUsers.value,
    activeUsers: '11,200',
    totalProperties: adminStats.totalProperties.value,
    totalAgreementsAnalyzed: adminStats.agreementsAnalyzed.value,
    monthlyRevenue: '1,24,000',
  };

  const platformAlerts = [
    { id: 1, type: 'High Risk Agreement', message: 'Cedar Heights - Lease.pdf flagged with 4 high-risk clauses.', severity: 'high' },
    { id: 2, type: 'System Performance', message: 'AI processing time increased by 1.2s average.', severity: 'medium' },
    { id: 3, type: 'Server Update', message: 'Scheduled maintenance completed successfully.', severity: 'low' },
  ];

  const recentActivity = mockRecentActivity;

  return (
    <div className="fade-in space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[8px] mb-[26px] overflow-hidden">
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Total Users</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{kpis.totalUsers}</div>
          <span className="font-mono text-[11.5px] text-text-faint">{kpis.activeUsers} active</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Total Properties</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{kpis.totalProperties}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Platform-wide</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">AI Analyses</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">{kpis.totalAgreementsAnalyzed}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Agreements processed</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Platform Revenue</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">₹{kpis.monthlyRevenue}</div>
          <span className="font-mono text-[11.5px] text-text-faint">Monthly recurring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[26px] mb-[26px] items-start">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
          <QuickActionCard 
            title="User Management" desc="Approve, suspend or review user accounts." 
            buttonText="Manage Users" icon="☺" to="/admin/users"
          />
          <QuickActionCard 
            title="System Audits" desc="View comprehensive platform audit logs." 
            buttonText="View Logs" icon="S" to="/admin/audit-logs"
          />
          <QuickActionCard 
            title="AI Usage" desc="Monitor OpenAI token usage and costs." 
            buttonText="View Stats" icon="✦" to="/admin/ai-usage"
          />
          <QuickActionCard 
            title="Platform Settings" desc="Configure global system parameters." 
            buttonText="Settings" icon="⚙" to="/admin/settings"
          />
        </div>

        {/* Platform Alerts */}
        <div className="bg-white border border-border rounded-[8px]">
          <div className="p-[20px] px-[24px] border-b border-border">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">Platform alerts</h3>
          </div>
          <div>
            {platformAlerts.map(alert => (
              <div key={alert.id} className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start">
                <span className={`w-[28px] h-[28px] rounded-[4px] flex items-center justify-center flex-none text-[15px] font-serif font-bold ${
                  alert.severity === 'high' ? 'bg-[#C24343]/10 text-[#C24343]' :
                  alert.severity === 'medium' ? 'bg-risk-amber-bg text-risk-amber' : 'bg-risk-green-bg text-risk-green'
                }`}>
                  {alert.severity === 'high' ? '!' : alert.severity === 'medium' ? '!' : '✓'}
                </span>
                <div>
                  <b className="text-[14px] font-semibold text-ink block mb-[4px]">{alert.type}</b>
                  <p className="text-[13px] text-text-muted m-0 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-border rounded-[8px]">
        <div className="p-[20px] px-[24px] border-b border-border flex justify-between items-center">
          <h3 className="font-serif font-medium text-[17px] text-ink m-0">Recent activity</h3>
          <Link to="/admin/audit-logs" className="font-semibold text-[12.5px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors">View logs</Link>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">User</th>
              <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">Action</th>
              <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map(activity => (
              <tr key={activity.id} className="hover:bg-paper-card transition-colors">
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border font-medium text-ink">{activity.user}</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-ink">{activity.desc}</td>
                <td className="p-[14px] px-[24px] text-[13px] border-b border-border text-text-muted">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;
