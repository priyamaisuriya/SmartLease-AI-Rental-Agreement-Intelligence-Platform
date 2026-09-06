import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, FileText, Calendar, Building, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';

const TenantDetails = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/landlord/tenants" className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-ink">Rahul Sharma</h1>
            <StatusBadge status="Active" />
          </div>
          <p className="text-text-muted mt-1">Tenant Details & Rental History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile & Contact */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
             <div className="w-24 h-24 bg-lease-100 text-lease-700 rounded-full flex items-center justify-center text-4xl font-display font-bold mx-auto mb-4">
               R
             </div>
             <h2 className="text-xl font-bold text-ink">Rahul Sharma</h2>
             <p className="text-text-muted text-sm">Tenant since Jan 2026</p>
             
             <div className="flex justify-center gap-4 mt-6">
               <button className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
                 <Phone className="w-4 h-4 text-good-600" /> Call
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
                 <Mail className="w-4 h-4 text-signal-600" /> Email
               </button>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warn-500" /> Upcoming Reminders
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-warn-50 border border-warn-500/20 rounded-lg">
                <p className="text-sm font-medium text-warn-800">Rent Due</p>
                <p className="text-xs text-warn-700 mt-1">October 5, 2026 (in 3 days)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Property & Agreement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-semibold text-ink mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-lease-600" /> Rental Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-muted">Property</p>
                <p className="font-medium text-ink mt-1">Sunset Apartments 4B</p>
                <Link to="/landlord/properties/1" className="text-xs text-lease-600 hover:underline mt-1 inline-block">View Property Details</Link>
              </div>
              <div>
                <p className="text-sm text-text-muted">Contractual Rent</p>
                <p className="font-medium text-ink mt-1">₹42,000 / month</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Security Deposit</p>
                <p className="font-medium text-ink mt-1">₹2,00,000</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Rental Start Date</p>
                <p className="font-medium text-ink mt-1">Jan 1, 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-lease-600" /> Active Agreement
              </h3>
              <StatusBadge status="Low Risk" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-text-muted">Agreement Expiry</p>
                <p className="font-medium text-ink mt-1">Dec 31, 2026</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Notice Period</p>
                <p className="font-medium text-ink mt-1">2 Months</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Lock-in Period</p>
                <p className="font-medium text-ink mt-1">6 Months (Completed)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/landlord/agreements" className="px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm">
                View Analysis Report
              </Link>
              <button className="px-4 py-2 bg-paper border border-border text-ink rounded-lg text-sm font-medium hover:bg-border/50 transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
