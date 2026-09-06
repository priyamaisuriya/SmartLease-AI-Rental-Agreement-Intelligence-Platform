import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building, Home, Users, ClipboardList, 
  FileText, BrainCircuit, MessageSquare, Bell, Calendar, 
  BarChart3, User, Settings, LogOut, Menu, X, PlusCircle
} from 'lucide-react';

const LandlordLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { section: 'Main', items: [
      { name: 'Dashboard', href: '/landlord', icon: LayoutDashboard },
    ]},
    { section: 'Property Management', items: [
      { name: 'My Properties', href: '/landlord/properties', icon: Building },
      { name: 'Add Property', href: '/landlord/properties/add', icon: PlusCircle },
      { name: 'Rental Requests', href: '/landlord/rental-requests', icon: ClipboardList },
      { name: 'Tenants', href: '/landlord/tenants', icon: Users },
    ]},
    { section: 'Agreements & AI', items: [
      { name: 'Agreements', href: '/landlord/agreements', icon: FileText },
      { name: 'AI Chat', href: '/landlord/chat', icon: MessageSquare },
      { name: 'Reminders', href: '/landlord/reminders', icon: Calendar },
      { name: 'Reports', href: '/landlord/reports', icon: BarChart3 },
    ]},
    { section: 'Communication', items: [
      { name: 'Notifications', href: '/landlord/notifications', icon: Bell },
    ]},
    { section: 'Account', items: [
      { name: 'Profile', href: '/landlord/profile', icon: User },
      { name: 'Settings', href: '/landlord/settings', icon: Settings },
    ]},
  ];

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-line transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-line">
          <div className="flex items-center gap-2 text-xl font-display font-bold text-ink">
            <div className="w-8 h-8 rounded-lg bg-lease-600 text-white flex items-center justify-center font-bold">
              S
            </div>
            SmartLease <span className="text-lease-600">Pro</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-ink-soft" />
          </button>
        </div>

        <div className="h-full overflow-y-auto scroll-thin pb-20">
          {navigation.map((group, idx) => (
            <div key={idx} className="px-4 py-4">
              <h3 className="px-2 text-xs font-semibold text-ink-faint uppercase tracking-wider mb-2">
                {group.section}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/landlord');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-lease-50 text-lease-700' 
                          : 'text-ink-soft hover:bg-canvas hover:text-ink'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-lease-600' : 'text-ink-faint'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="px-4 pb-4">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-bad-600 hover:bg-bad-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex-shrink-0 bg-surface border-b border-line">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button 
              className="lg:hidden p-2 rounded-md text-ink-soft hover:bg-canvas"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none"></div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-ink-soft hover:bg-canvas rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bad-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-line pl-4">
                <div className="w-9 h-9 rounded-full bg-lease-100 flex items-center justify-center text-lease-700 font-medium">
                  JS
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-ink">John Smith</p>
                  <p className="text-ink-faint text-xs">Landlord</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-thin focus:outline-none bg-canvas">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandlordLayout;
