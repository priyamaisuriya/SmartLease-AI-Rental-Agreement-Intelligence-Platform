import React from 'react';
import { User, Mail, ShieldCheck } from 'lucide-react';

const AdminProfile = () => {
  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Admin Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="h-32 bg-ink"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-16 mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-paper flex items-center justify-center text-4xl font-bold text-ink flex-shrink-0">
              AD
            </div>
            <div className="pt-2 sm:pt-16 flex-1">
              <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
                Admin User <ShieldCheck className="w-5 h-5 text-lease-600" />
              </h2>
              <p className="text-text-muted font-medium">Super Administrator</p>
            </div>
            <div className="pt-2 sm:pt-16">
              <button className="px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-semibold text-ink border-b border-border pb-2">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-text-faint">Email Address</p>
                    <p className="font-medium text-ink mt-0.5">admin@smartlease.ai</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-text-faint">Role & Permissions</p>
                    <p className="font-medium text-ink mt-0.5">Super Admin (All Access)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
