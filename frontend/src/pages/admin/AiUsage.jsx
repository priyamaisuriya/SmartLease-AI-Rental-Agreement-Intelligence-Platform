import React, { useState } from 'react';
import { 
  BrainCircuit, Zap, CheckCircle2, XCircle, Clock, Calendar, ChevronDown 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import { agreementRiskData, aiUsageTimeData } from '../../data/adminMockData';

const AiUsage = () => {
  const [dateFilter, setDateFilter] = useState('30 Days');

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-ink">AI Usage Dashboard</h1>
          <p className="text-text-muted mt-1 text-[14px]">Monitor AI engine performance and feature utilization.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-border transition-all"
          >
            <option>7 Days</option>
            <option>30 Days</option>
            <option>6 Months</option>
            <option>1 Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total AI Analyses" 
          value="12,450" 
          trend="+15%" isPositive={true}
          icon={BrainCircuit}
        />
        <StatCard 
          title="Total AI Requests" 
          value="45,800" 
          trend="+22%" isPositive={true}
          icon={Zap}
        />
        <StatCard 
          title="Successful Analyses" 
          value="12,120" 
          desc="97.3% success rate"
          icon={CheckCircle2}
        />
        <StatCard 
          title="Failed Analyses" 
          value="330" 
          desc="2.7% failure rate"
          icon={XCircle}
        />
        <StatCard 
          title="Avg. Processing Time" 
          value="1.2s" 
          trend="-0.1s" isPositive={true}
          icon={Clock}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="AI Usage & Processing Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiUsageTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E2D6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E6E2D6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}
                  cursor={{ stroke: '#E6E2D6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="totalRequests" name="Total Requests" stroke="#5B57E8" strokeWidth={3} dot={{ r: 4, fill: '#white', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="processingTime" name="Processing Time (s)" stroke="#C1811F" strokeWidth={3} dot={{ r: 4, fill: '#white', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-1">
          <ChartCard title="Analysis Risk Results">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agreementRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {agreementRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E6E2D6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}
                  itemStyle={{ color: '#1B2A4A', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Feature Usage Bar Chart */}
      <div className="bg-white p-6 rounded-[8px] shadow-sm border border-border">
        <h3 className="font-semibold text-ink text-[16px] mb-6">AI Feature Utilization</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Agreement Analysis', calls: 12450 },
                { name: 'AI Chat', calls: 24800 },
                { name: 'Summary Gen', calls: 5200 },
                { name: 'Report Gen', calls: 3350 },
              ]}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E6E2D6" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8577' }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1B2A4A', fontWeight: 500 }} />
              <RechartsTooltip 
                cursor={{ fill: '#F5F2EA' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E6E2D6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="calls" name="API Calls" fill="#C9A24B" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AiUsage;
