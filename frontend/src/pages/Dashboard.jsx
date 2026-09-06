import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="fade-in space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[8px] mb-[26px] overflow-hidden">
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Agreements</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">6</div>
          <span className="font-mono text-[11.5px] text-text-faint">2 uploaded this month</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Flagged risks</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">3</div>
          <span className="font-mono text-[11.5px] text-text-faint">Across 2 agreements</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Upcoming deadlines</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">2</div>
          <span className="font-mono text-[11.5px] text-text-faint">Next in 9 days</span>
        </div>
        <div className="bg-white p-[22px]">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-text-muted uppercase block font-semibold">Chat questions</span>
          <div className="font-serif text-[36px] font-medium my-[8px] text-ink">14</div>
          <span className="font-mono text-[11.5px] text-text-faint">This month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[26px] mb-[26px] items-start">
        {/* Recent Agreements */}
        <div className="bg-white border border-border rounded-[8px]">
          <div className="p-[20px] px-[24px] border-b border-border flex items-center justify-between">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">Recent agreements</h3>
            <Link to="/history" className="font-semibold text-[12.5px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors">View all</Link>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">Title</th>
                <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">Uploaded</th>
                <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper">Status</th>
                <th className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-text-muted font-bold p-[14px] px-[24px] border-b border-border bg-paper"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-paper-card transition-colors">
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-ink">2BHK Lease — Vesu, Surat</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-text-muted">Aug 15, 2026</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <span className="font-mono text-[10px] font-bold tracking-[0.05em] px-[10px] py-[4px] rounded-[20px] uppercase inline-block bg-risk-green-bg text-risk-green">Analyzed</span>
                </td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <Link to="/analysis" className="font-semibold text-[13px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors">Open</Link>
                </td>
              </tr>
              <tr className="hover:bg-paper-card transition-colors">
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-ink">Shop Lease — City Light</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-text-muted">Aug 10, 2026</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <span className="font-mono text-[10px] font-bold tracking-[0.05em] px-[10px] py-[4px] rounded-[20px] uppercase inline-block bg-risk-green-bg text-risk-green">Analyzed</span>
                </td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <Link to="/analysis" className="font-semibold text-[13px] text-ink underline underline-offset-4 hover:text-gold-deep transition-colors">Open</Link>
                </td>
              </tr>
              <tr className="hover:bg-paper-card transition-colors">
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-ink">Studio Apt — Adajan</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border text-text-muted">Aug 4, 2026</td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <span className="font-mono text-[10px] font-bold tracking-[0.05em] px-[10px] py-[4px] rounded-[20px] uppercase inline-block bg-risk-amber-bg text-risk-amber">Processing</span>
                </td>
                <td className="p-[14px] px-[24px] text-[13.5px] border-b border-border">
                  <span className="font-medium text-[13px] text-text-faint">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white border border-border rounded-[8px]">
          <div className="p-[20px] px-[24px] border-b border-border">
            <h3 className="font-serif font-medium text-[17px] text-ink m-0">Risk alerts</h3>
          </div>
          <div>
            <div className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start">
              <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">!</span>
              <div>
                <b className="text-[14px] font-semibold text-ink block mb-[4px]">Short entry-notice clause</b>
                <p className="text-[13px] text-text-muted m-0 leading-relaxed">2BHK Lease — Vesu · landlord entry with only 4 hrs notice</p>
              </div>
            </div>
            <div className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start">
              <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">!</span>
              <div>
                <b className="text-[14px] font-semibold text-ink block mb-[4px]">Long deposit refund window</b>
                <p className="text-[13px] text-text-muted m-0 leading-relaxed">2BHK Lease — Vesu · 45 business days to refund</p>
              </div>
            </div>
            <div className="flex gap-[16px] p-[18px] px-[24px] border-b border-border last:border-b-0 items-start">
              <span className="w-[28px] h-[28px] rounded-[4px] bg-[#C24343]/10 text-[#C24343] flex items-center justify-center flex-none text-[15px] font-serif font-bold">!</span>
              <div>
                <b className="text-[14px] font-semibold text-ink block mb-[4px]">Auto-renewal clause</b>
                <p className="text-[13px] text-text-muted m-0 leading-relaxed">Shop Lease — City Light · renews unless cancelled 60 days prior</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white border border-border rounded-[8px]">
        <div className="p-[20px] px-[24px] border-b border-border">
          <h3 className="font-serif font-medium text-[17px] text-ink m-0">Upcoming reminders</h3>
        </div>
        <div>
          <div className="flex justify-between items-center p-[16px] px-[24px] border-b border-border last:border-b-0">
            <div className="text-[14px] font-medium text-ink">Notice deadline — Shop Lease, City Light</div>
            <span className="font-mono text-[11.5px] font-medium bg-paper border border-border text-text-muted px-[10px] py-[5px] rounded-[4px] whitespace-nowrap">
              In 9 days
            </span>
          </div>
          <div className="flex justify-between items-center p-[16px] px-[24px] border-b border-border last:border-b-0">
            <div className="text-[14px] font-medium text-ink">Rent due — 2BHK Lease, Vesu</div>
            <span className="font-mono text-[11.5px] font-medium bg-paper border border-border text-text-muted px-[10px] py-[5px] rounded-[4px] whitespace-nowrap">
              In 16 days
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
