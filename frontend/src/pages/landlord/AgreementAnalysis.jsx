import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, AlertTriangle, ShieldCheck, HelpCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RiskCard = ({ type, title, desc, action }) => {
  let styles = '';
  let Icon = AlertCircle;

  if (type === 'high') {
    styles = 'bg-bad-50 border-bad-500/20 text-bad-800';
    Icon = AlertTriangle;
  } else if (type === 'medium') {
    styles = 'bg-warn-50 border-warn-500/20 text-warn-800';
    Icon = AlertCircle;
  } else {
    styles = 'bg-good-50 border-good-500/20 text-good-800';
    Icon = ShieldCheck;
  }

  return (
    <div className={`p-4 border rounded-xl flex items-start gap-4 ${styles}`}>
      <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${type === 'high' ? 'text-bad-600' : type === 'medium' ? 'text-warn-600' : 'text-good-600'}`} />
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm mt-1 opacity-90">{desc}</p>
        {action && (
          <p className="text-xs font-medium mt-3 uppercase tracking-wider opacity-80">
            Suggested Action: {action}
          </p>
        )}
      </div>
    </div>
  );
};

const AgreementAnalysis = () => {
  const { agreementId } = useParams();

  // Mock score data
  const riskData = [
    { name: 'Risk', value: 35, fill: '#E8A34F' }, // warn-500
    { name: 'Safe', value: 65, fill: '#F6F7FB' }  // canvas
  ];

  if (!agreementId) {
    return (
      <div className="fade-in max-w-6xl mx-auto">
        <div className="rounded-xl2 border border-border bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold-deep mb-4">
            <BrainCircuit size={24} />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Select an agreement to analyze
          </h2>
          <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
            Choose a tenant's agreement to view AI-powered risk analysis, extracted financial terms, and hidden anomalies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/landlord/agreements" className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-lease-600" />
              <h1 className="text-2xl font-display font-bold text-ink">Agreement Intelligence</h1>
            </div>
            <p className="text-text-muted mt-1">AI-powered risk analysis for Sunset_Apt_Lease_2026.pdf</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/landlord/chat/${agreementId}`} className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Ask AI</span>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Overview & Risk Score */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
            <h3 className="font-semibold text-ink mb-6">Overall Risk Score</h3>
            <div className="relative w-48 h-48 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-display font-bold text-warn-600">35</span>
                <span className="text-sm font-medium text-warn-600 uppercase tracking-wider">Medium Risk</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-lease-600" /> Contract Summary
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Tenant</span>
                <span className="font-medium text-ink">Rahul Sharma</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Property</span>
                <span className="font-medium text-ink">Sunset Apartments 4B</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Start Date</span>
                <span className="font-medium text-ink">Jan 1, 2026</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-text-muted">End Date</span>
                <span className="font-medium text-ink">Dec 31, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Extracted Data & Risks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 bg-lease-50 border-b border-lease-100 flex items-center justify-between">
              <h3 className="font-semibold text-lease-900">Extracted Financial Terms</h3>
              <span className="text-xs font-medium text-lease-600 bg-lease-100 px-2 py-1 rounded-full">AI Extracted</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-muted">Contractual Monthly Rent</p>
                <p className="text-xl font-bold text-ink mt-1">₹42,000</p>
                <p className="text-xs text-bad-500 mt-1">Note: Differs from listed rent (₹45,000)</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Security Deposit</p>
                <p className="text-xl font-bold text-ink mt-1">₹2,00,000</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Maintenance</p>
                <p className="text-base font-semibold text-ink mt-1">Included in Rent</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Late Payment Penalty</p>
                <p className="text-base font-semibold text-ink mt-1">1% per day after 5th</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink mb-4 text-lg">Detected Risks & Anomalies</h3>
            <div className="space-y-4">
              <RiskCard 
                type="high"
                title="Missing Lock-in Period Clause"
                desc="The agreement does not explicitly state a lock-in period. This means the tenant may legally terminate the agreement at any time by providing standard notice, reducing your rental security."
                action="Amend agreement to include a standard 6-month lock-in period."
              />
              <RiskCard 
                type="medium"
                title="Unclear Repair Responsibilities"
                desc="Clause 7.2 regarding major repairs is ambiguous. It states 'tenant must maintain' but doesn't clarify who pays for structural damages."
                action="Clarify distinction between routine maintenance (tenant) and structural repairs (landlord)."
              />
              <RiskCard 
                type="low"
                title="Standard Subletting Prohibition"
                desc="The agreement correctly and explicitly forbids subletting or commercial use of the residential property."
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-ink mb-4">Important Clauses</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink">Termination (Clause 9)</span>
              <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink">Security Deposit (Clause 4)</span>
              <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink">Rent Increase (Clause 3)</span>
              <span className="px-3 py-1.5 bg-paper border border-border rounded-lg text-sm text-ink">Painting (Clause 11)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementAnalysis;
