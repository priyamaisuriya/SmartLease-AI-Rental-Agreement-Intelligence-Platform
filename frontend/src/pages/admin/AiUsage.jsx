import React, { useCallback, useEffect, useState } from 'react';
import { BrainCircuit, CheckCircle2, XCircle, Percent } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';

import api from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import StatusBadge from '../../components/admin/StatusBadge';

const RANGES = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
  { label: 'All time', days: 0 },
];

const OPERATION_LABELS = {
  summary: 'Agreement Summary',
  risk_detection: 'Risk Detection',
  clause_explanation: 'Clause Explanation',
  question: 'Agreement Q&A',
  conditions_analysis: 'Conditions Analysis',
  document_chat: 'Document Chat',
};

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #E6E2D6',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
};

const AiUsage = () => {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, listRes] = await Promise.all([
        api.get('/ai-usage/stats', { params: days ? { days } : {} }),
        api.get('/ai-usage', { params: { limit: 15 } }),
      ]);
      setStats(statsRes.data);
      setRecent(listRes.data.usage || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI usage.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const operationData = stats
    ? Object.entries(stats.operations).map(([key, calls]) => ({ name: OPERATION_LABELS[key] || key, calls }))
    : [];

  const failureRate = stats && stats.total ? Math.round((stats.failed / stats.total) * 1000) / 10 : null;

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-ink">AI Usage Dashboard</h1>
          <p className="text-text-muted mt-1 text-[14px]">Monitor AI feature utilization and reliability.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-border"
        >
          {RANGES.map((r) => (
            <option key={r.label} value={r.days}>{r.label}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 text-sm rounded-lg text-risk-red bg-risk-red-bg">{error}</div>}

      {loading && !stats ? (
        <p className="text-text-muted">Loading...</p>
      ) : stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total AI Requests" value={stats.total.toLocaleString('en-IN')} icon={BrainCircuit} />
            <StatCard title="Successful" value={stats.successful.toLocaleString('en-IN')} icon={CheckCircle2} />
            <StatCard
              title="Failed"
              value={stats.failed.toLocaleString('en-IN')}
              desc={failureRate !== null ? `${failureRate}% failure rate` : 'No requests yet'}
              icon={XCircle}
            />
            <StatCard
              title="Success Rate"
              value={stats.successRate !== null ? `${stats.successRate}%` : '—'}
              icon={Percent}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Requests Over Time">
                {stats.daily.length === 0 ? (
                  <p className="text-sm text-text-muted">No AI requests in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E2D6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} />
                      <RechartsTooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="total" name="Requests" stroke="#5B57E8" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="failed" name="Failed" stroke="#C24343" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="bg-white p-6 rounded-[8px] shadow-sm border border-border">
              <h3 className="font-semibold text-ink text-[16px] mb-4">Top Users</h3>
              {stats.topUsers.length === 0 ? (
                <p className="text-sm text-text-muted">No usage yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.topUsers.map((u, i) => (
                    <li key={`${u.email}-${i}`} className="py-3 flex items-center justify-between text-sm">
                      <span>
                        <span className="font-medium text-ink">{u.name}</span>
                        <span className="block text-xs text-text-muted">{u.email}</span>
                      </span>
                      <span className="font-semibold text-ink">{u.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[8px] shadow-sm border border-border">
            <h3 className="font-semibold text-ink text-[16px] mb-6">AI Feature Utilization</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#E6E2D6" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} />
                  <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1B2A4A', fontWeight: 500 }} />
                  <RechartsTooltip cursor={{ fill: '#F5F2EA' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="calls" name="Requests" fill="#C9A24B" radius={[0, 4, 4, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[8px] shadow-sm border border-border overflow-hidden">
            <h3 className="font-semibold text-ink text-[16px] p-6 pb-3">Recent Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper text-text-muted text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2">When</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Feature</th>
                    <th className="px-4 py-2">Agreement</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No requests yet.</td></tr>
                  ) : recent.map((r) => (
                    <tr key={r._id}>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2">{r.user?.name || '—'}</td>
                      <td className="px-4 py-2">{OPERATION_LABELS[r.operation] || r.operation}</td>
                      <td className="px-4 py-2">{r.agreement?.title || '—'}</td>
                      <td className="px-4 py-2"><StatusBadge status={r.status === 'success' ? 'Success' : 'Failed'} /></td>
                      <td className="px-4 py-2 text-xs text-text-muted max-w-[260px] truncate" title={r.errorMessage}>{r.errorMessage || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AiUsage;
