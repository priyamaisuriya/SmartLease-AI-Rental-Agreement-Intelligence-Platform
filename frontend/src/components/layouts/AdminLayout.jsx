import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Users, Building, FileText, Inbox, BarChart, ShieldAlert, Activity, FileBarChart, Settings, Bell, MessageSquare, Search } from 'lucide-react';

const NAV_ITEMS = [
  { id: '/admin', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
  { id: '/admin/users', label: 'Users', icon: Users, section: 'Management' },
  { id: '/admin/properties', label: 'Properties', icon: Building, section: 'Management' },
  { id: '/admin/rental-requests', label: 'Rental Requests', icon: Inbox, section: 'Management' },
  { id: '/admin/agreements', label: 'Agreements', icon: FileText, section: 'Management' },
  { id: '/admin/ai-usage', label: 'AI Usage', icon: Activity, section: 'AI & Reports' },
  { id: '/admin/reports', label: 'Reports', icon: BarChart, section: 'AI & Reports' },
  { id: '/admin/feedback', label: 'Feedback', icon: MessageSquare, section: 'AI & Reports' },
  { id: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert, section: 'System' },
  { id: '/admin/notifications', label: 'Notifications', icon: Bell, badge: '2', section: 'System' },
  { id: '/admin/profile', label: 'Profile', icon: Users, section: 'Account' },
  { id: '/admin/settings', label: 'Settings', icon: Settings, section: 'Account' },
];

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Group nav items by section for the sidebar
  const sections = Array.from(new Set(NAV_ITEMS.map(item => item.section)));

  const currentItem = NAV_ITEMS.find(item => location.pathname === item.id || location.pathname.startsWith(item.id + '/')) || NAV_ITEMS[0];
  const pageTitle = currentItem.label;
  const eyebrow = currentItem.section;

  return (
    <div id="app-shell" className="flex min-h-screen bg-paper overflow-hidden font-sans text-ink">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-gradient-to-b from-ink-dark to-[#101a2e] lg:flex px-[18px] py-[28px]">
        
        <div className="flex items-center gap-2.5 px-2 mb-[34px]">
          <div className="w-[34px] h-[34px] rounded-[3px] border border-gold flex items-center justify-center bg-gold/5 shrink-0">
            <span className="font-serif font-bold text-gold text-lg">S</span>
          </div>
          <span className="text-[13px] tracking-[0.14em] uppercase text-[#EDEBE3] font-semibold">
            SmartLease <span className="text-gold">Admin</span>
          </span>
        </div>

        <nav className="scroll-thin flex-1 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-[22px]">
              <div className="text-[10.5px] uppercase tracking-[0.12em] text-ink-muted px-3 mb-2 font-semibold">
                {section}
              </div>
              <div className="space-y-[2px]">
                {NAV_ITEMS.filter(item => item.section === section).map(item => (
                  <NavLink key={item.id} to={item.id} end={item.id === '/admin'} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto text-[10.5px] bg-[#C1443C] text-white px-[6px] py-[1px] rounded-[10px] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-ink-line flex items-center gap-2.5 px-2 mt-4">
          <div className="w-8 h-8 rounded-full bg-gold text-ink-dark flex items-center justify-center text-[13px] font-bold font-serif shrink-0">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">Admin User</div>
            <div className="text-[11px] text-ink-muted block">Super Admin</div>
          </div>
          <LogOut className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto" />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-ink-dark/50" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[248px] flex-col bg-gradient-to-b from-ink-dark to-[#101a2e] flex transition-transform duration-300 lg:hidden px-[18px] py-[28px] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 mb-[34px]">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[3px] border border-gold flex items-center justify-center bg-gold/5 shrink-0">
              <span className="font-serif font-bold text-gold text-lg">S</span>
            </div>
            <span className="text-[13px] tracking-[0.14em] uppercase text-[#EDEBE3] font-semibold">
              SmartLease <span className="text-gold">Admin</span>
            </span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-ink-faint hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="scroll-thin flex-1 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-[22px]">
              <div className="text-[10.5px] uppercase tracking-[0.12em] text-ink-muted px-3 mb-2 font-semibold">
                {section}
              </div>
              <div className="space-y-[2px]">
                {NAV_ITEMS.filter(item => item.section === section).map(item => (
                  <NavLink key={item.id} to={item.id} end={item.id === '/admin'} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto text-[10.5px] bg-[#C1443C] text-white px-[6px] py-[1px] rounded-[10px] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-ink-line flex items-center gap-2.5 px-2 mt-4">
          <div className="w-8 h-8 rounded-full bg-gold text-ink-dark flex items-center justify-center text-[13px] font-bold font-serif shrink-0">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">Admin User</div>
            <div className="text-[11px] text-ink-muted block">Super Admin</div>
          </div>
          <LogOut className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto" onClick={() => setMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Topbar */}
        <header className="px-10 pt-[26px] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-2 text-ink lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-text-muted m-0 font-semibold mb-1">{eyebrow}</p>
              <h1 className="text-[26px] font-serif font-medium m-0 text-ink">{pageTitle}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 w-64 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20 transition-all placeholder:text-placeholder"
              />
            </div>
            <button className="relative p-2 text-text-muted hover:text-ink hover:bg-paper-card rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-risk-amber rounded-full border-2 border-paper"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif text-sm font-bold shadow-sm ml-2 cursor-pointer hover:bg-ink-dark transition-colors">
              AD
            </div>
          </div>
        </header>

        {/* Page container */}
        <main id="page-container" className="flex-1 overflow-y-auto scroll-thin px-10 pt-5 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
