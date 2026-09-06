import React, { useState } from 'react';
import { 
  Users, Building, FileText, BrainCircuit, Activity, 
  Clock, TrendingUp, Search, Calendar, ChevronDown, User, BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import { 
  adminStats, userGrowthData, propertyStatsData, recentActivity 
} from '../../data/adminMockData';

const AdminDashboard = () => {
  const [dateFilter, setDateFilter] = useState('30 Days');

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Welcome back, Admin</h1>
          <p className="text-ink-soft mt-1">Monitor and manage the SmartLease AI platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-surface border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors">
            <Calendar className="w-4 h-4 text-ink-soft" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={adminStats.totalUsers.value} 
          trend={adminStats.totalUsers.trend}
          isPositive={adminStats.totalUsers.isPositive}
          desc="this month"
          icon={Users}
        />
        <StatCard 
          title="Total Properties" 
          value={adminStats.totalProperties.value} 
          trend={adminStats.totalProperties.trend}
          isPositive={adminStats.totalProperties.isPositive}
          desc="this month"
          icon={Building}
        />
        <StatCard 
          title="Rental Requests" 
          value={adminStats.rentalRequests.value} 
          trend={adminStats.rentalRequests.trend}
          isPositive={adminStats.rentalRequests.isPositive}
          desc="this month"
          icon={ClipboardList => <FileText className="w-5 h-5" />} // Using FileText
        />
        <StatCard 
          title="Agreements Analyzed" 
          value={adminStats.agreementsAnalyzed.value} 
          trend={adminStats.agreementsAnalyzed.trend}
          isPositive={adminStats.agreementsAnalyzed.isPositive}
          desc="this month"
          icon={FileText}
        />
        <StatCard 
          title="AI Analyses" 
          value={adminStats.aiAnalyses.value} 
          trend={adminStats.aiAnalyses.trend}
          isPositive={adminStats.aiAnalyses.isPositive}
          desc="this month"
          icon={BrainCircuit}
        />
        <StatCard 
          title="Active Rentals" 
          value={adminStats.activeRentals.value} 
          trend={adminStats.activeRentals.trend}
          isPositive={adminStats.activeRentals.isPositive}
          desc="this month"
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Line Chart */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="Platform User Growth"
            action={
              <button className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
                {dateFilter} <ChevronDown className="w-4 h-4" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8FA3' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8FA3' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#E7E9F2', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#5B57E8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#5B57E8', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#A672F0" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Property Stats Donut Chart */}
        <div className="lg:col-span-1">
          <ChartCard title="Property Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {propertyStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1E2233', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-ink">Recent System Activity</h3>
          <button className="text-sm font-medium text-lease-600 hover:text-lease-700">View All Logs</button>
        </div>
        <div className="divide-y divide-line">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 sm:px-6 hover:bg-canvas/50 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'user' ? 'bg-signal-50 text-signal-600' :
                  activity.type === 'property' ? 'bg-lease-50 text-lease-600' :
                  activity.type === 'request' ? 'bg-good-50 text-good-600' :
                  'bg-ink-100 text-ink-600'
                }`}>
                  {activity.type === 'user' && <User className="w-5 h-5" />}
                  {activity.type === 'property' && <Building className="w-5 h-5" />}
                  {activity.type === 'request' && <FileText className="w-5 h-5" />}
                  {activity.type === 'ai' && <BrainCircuit className="w-5 h-5" />}
                  {activity.type === 'report' && <BarChart3 className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{activity.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-ink-soft font-medium">{activity.user}</span>
                    <span className="w-1 h-1 rounded-full bg-line"></span>
                    <span className="text-xs text-ink-faint flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
