import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6 fade-in pb-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Profile Settings</h1>
      
      <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
        <div className="h-32 bg-lease-600"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-16 mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-canvas flex items-center justify-center text-4xl font-bold text-lease-600 flex-shrink-0">
              JS
            </div>
            <div className="pt-2 sm:pt-16 flex-1">
              <h2 className="text-2xl font-bold text-ink">John Smith</h2>
              <p className="text-ink-soft font-medium">Landlord</p>
            </div>
            <div className="pt-2 sm:pt-16">
              <button className="px-4 py-2 bg-canvas border border-line rounded-lg text-sm font-medium text-ink hover:bg-line/50 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-semibold text-ink border-b border-line pb-2">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="w-5 h-5 text-ink-soft flex-shrink-0" />
                  <div>
                    <p className="text-ink-faint">Email Address</p>
                    <p className="font-medium text-ink mt-0.5">john.smith@example.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="w-5 h-5 text-ink-soft flex-shrink-0" />
                  <div>
                    <p className="text-ink-faint">Phone Number</p>
                    <p className="font-medium text-ink mt-0.5">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-ink border-b border-line pb-2">Business Address</h3>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-ink-soft flex-shrink-0" />
                <div>
                  <p className="text-ink-faint">Address</p>
                  <p className="font-medium text-ink mt-0.5">
                    123 Property Plaza,<br />
                    Indiranagar, Bangalore<br />
                    Karnataka - 560038
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
