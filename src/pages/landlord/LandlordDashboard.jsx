import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, CheckCircle, Home, Clock, Users, 
  FileText, PlusCircle, Bell, ChevronDown, Calendar, ClipboardList
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';

import { 
  landlordStats, landlordRentalRequests, 
  landlordReminders, landlordChartData 
} from '../../data/landlordMockData';

const QuickActionCard = ({ title, desc, buttonText, icon: Icon, to, colorClass }) => (
  <div className="bg-surface p-6 rounded-xl shadow-sm border border-line flex flex-col">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-ink text-lg">{title}</h3>
    <p className="text-sm text-ink-soft mt-1 flex-1">{desc}</p>
    <Link to={to} className="mt-6 w-full text-center py-2 px-4 border border-line rounded-lg text-sm font-medium hover:bg-canvas transition-colors text-ink">
      {buttonText}
    </Link>
  </div>
);

const LandlordDashboard = () => {
  const [dateFilter, setDateFilter] = useState('30 Days');

  const requestColumns = [
    { header: 'Tenant', accessor: 'tenant', render: (row) => <span className="font-medium text-ink">{row.tenant}</span> },
    { header: 'Property', accessor: 'property' },
    { header: 'Listed Rent', accessor: 'rent', render: (row) => <span>₹{row.rent.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <Link to="/landlord/rental-requests" className="text-sm text-lease-600 hover:text-lease-700 font-medium">
          View
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Good Morning, John</h1>
          <p className="text-ink-soft mt-1">Here’s an overview of your rental properties.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/landlord/properties/add" className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Properties" value={landlordStats.totalProperties.value} icon={Building} />
        <StatCard title="Available" value={landlordStats.availableProperties.value} icon={Home} />
        <StatCard title="Rented" value={landlordStats.rentedProperties.value} icon={CheckCircle} />
        <StatCard title="Requests" value={landlordStats.pendingRequests.value} icon={Clock} />
        <StatCard title="Tenants" value={landlordStats.activeTenants.value} icon={Users} />
        <StatCard title="Agreements" value={landlordStats.agreements.value} icon={FileText} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard 
            title="Add New Property" desc="List a new rental property." 
            buttonText="Add Property" icon={PlusCircle} to="/landlord/properties/add"
            colorClass="bg-lease-50 text-lease-600"
          />
          <QuickActionCard 
            title="Rental Requests" desc="Review new tenant requests." 
            buttonText="View Requests" icon={ClipboardList} to="/landlord/rental-requests"
            colorClass="bg-signal-50 text-signal-600"
          />
          <QuickActionCard 
            title="Agreements" desc="Manage and analyze agreements." 
            buttonText="View Agreements" icon={FileText} to="/landlord/agreements"
            colorClass="bg-good-50 text-good-600"
          />
          <QuickActionCard 
            title="Add Reminder" desc="Never miss an important deadline." 
            buttonText="Add Reminder" icon={Bell} to="/landlord/reminders"
            colorClass="bg-warn-50 text-warn-600"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Monthly Rental Overview"
            action={
              <button className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink border border-line px-3 py-1.5 rounded-md">
                {dateFilter} <ChevronDown className="w-4 h-4" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landlordChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8FA3' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8FA3' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F6F7FB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="rented" name="Rented Properties" fill="#5B57E8" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="available" name="Available Properties" fill="#C9C9FB" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h3 className="font-semibold text-ink">Upcoming Reminders</h3>
              <Link to="/landlord/reminders" className="text-sm font-medium text-lease-600 hover:text-lease-700">View All</Link>
            </div>
            <div className="divide-y divide-line flex-1 overflow-y-auto">
              {landlordReminders.map(rem => (
                <div key={rem.id} className="p-4 hover:bg-canvas/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-warn-50 text-warn-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{rem.title}</p>
                      <p className="text-xs text-ink-soft mt-1">{rem.property}</p>
                      <p className="text-xs font-medium text-warn-600 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {rem.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-ink">Recent Rental Requests</h3>
          <Link to="/landlord/rental-requests" className="text-sm font-medium text-lease-600 hover:text-lease-700">Manage Requests</Link>
        </div>
        <DataTable columns={requestColumns} data={landlordRentalRequests} />
      </div>

    </div>
  );
};

export default LandlordDashboard;
