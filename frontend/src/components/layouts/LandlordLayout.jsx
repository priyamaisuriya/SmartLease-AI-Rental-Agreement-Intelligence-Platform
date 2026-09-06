import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, ClipboardList, FileText, BrainCircuit, MessageSquare, Bell, Calendar, BarChart3, User, Settings, LogOut, Menu, X, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: '/landlord', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
  { id: '/landlord/properties', label: 'My Properties', icon: Building, section: 'Property Management' },
  { id: '/landlord/rental-requests', label: 'Rental Requests', icon: ClipboardList, badge: '3', section: 'Property Management' },
  { id: '/landlord/tenants', label: 'Tenants', icon: Users, section: 'Property Management' },
  { id: '/landlord/agreements', label: 'Agreements', icon: FileText, section: 'Agreements & AI' },
  { id: '/landlord/analysis', label: 'AI Analysis', icon: BrainCircuit, section: 'Agreements & AI' },
  { id: '/landlord/chat', label: 'AI Chat', icon: MessageSquare, section: 'Agreements & AI' },
  { id: '/landlord/reminders', label: 'Reminders', icon: Calendar, section: 'Agreements & AI' },
  { id: '/landlord/reports', label: 'Reports', icon: BarChart3, section: 'Agreements & AI' },
  { id: '/landlord/notifications', label: 'Notifications', icon: Bell, badge: '1', section: 'Communication' },
  { id: '/landlord/feedback', label: 'Feedback', icon: MessageSquare, section: 'Communication' },
  { id: '/landlord/profile', label: 'Profile', icon: User, section: 'Account' },
  { id: '/landlord/settings', label: 'Settings', icon: Settings, section: 'Account' },
];

const LandlordLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Rental Request',
      message: 'Jiya has requested to rent "kkk".',
      time: '10 mins ago'
    },
    {
      id: 2,
      title: 'Agreement Generated',
      message: 'The lease agreement for "Furnished 1BHK" is ready.',
      time: '2 hours ago'
    }
  ]);
  const location = useLocation();

  const { user, logout } = useAuth();

  const getInitial = () => {
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'LL';
  };

  // Group nav items by section for the sidebar
  const sections = Array.from(new Set(NAV_ITEMS.map(item => item.section)));

  const currentItem = NAV_ITEMS.find(item => location.pathname === item.id || location.pathname.startsWith(item.id + '/')) || NAV_ITEMS[0];
  const pageTitle = currentItem.label;
  const eyebrow = currentItem.section;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div id="app-shell" className="flex min-h-screen bg-paper overflow-hidden font-sans text-ink">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-gradient-to-b from-ink-dark to-[#101a2e] lg:flex px-[18px] py-[28px]">

        <div className="flex items-center gap-2.5 px-2 mb-[34px]">
          <div className="w-[34px] h-[34px] rounded-[3px] border border-gold flex items-center justify-center bg-gold/5 shrink-0">
            <span className="font-serif font-bold text-gold text-lg">S</span>
          </div>
          <span className="text-[13px] tracking-[0.14em] uppercase text-[#EDEBE3] font-semibold">
            SmartLease <span className="text-gold">Pro</span>
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
                  <NavLink key={item.id} to={item.id} end={item.id === '/landlord'} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
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
            {getInitial()}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">{user?.name || 'Landlord User'}</div>
            <div className="text-[11px] text-ink-muted block capitalize">{user?.role || 'Landlord'}</div>
          </div>
          <LogOut
            className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto"
            onClick={handleLogout}
          />
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
              SmartLease <span className="text-gold">Pro</span>
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
                  <NavLink key={item.id} to={item.id} end={item.id === '/landlord'} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
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
            {getInitial()}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">{user?.name || 'Landlord User'}</div>
            <div className="text-[11px] text-ink-muted block capitalize">{user?.role || 'Landlord'}</div>
          </div>
          <LogOut
            className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen min-h-0">
        {/* Topbar */}
        <header className="px-10 pt-[26px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-2 text-ink lg:hidden">
              <Menu size={20} />
            </button>
            {/* Header text removed as requested */}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="relative p-2 text-text-muted hover:text-ink hover:bg-paper-card rounded-lg transition-colors"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-risk-amber rounded-full border-2 border-paper"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-ink">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications(([]) )}
                        className="text-xs text-text-muted hover:text-risk-red transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto scroll-thin">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="group relative px-4 py-3 border-b border-border hover:bg-paper-card cursor-pointer transition-colors pr-10">
                          <p className="text-sm text-ink font-medium">{n.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-text-faint mt-1 block">{n.time}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(notifications.filter(notif => notif.id !== n.id));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-faint hover:text-risk-red opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-text-muted">
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-border text-center">
                    <Link to="/landlord/notifications" onClick={() => setNotificationsOpen(false)} className="text-xs font-medium text-lease-600 hover:text-lease-700">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif text-sm font-bold shadow-sm ml-2 cursor-pointer hover:bg-ink-dark transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {getInitial()}
              </div>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border py-1 z-50">
                  <Link
                    to="/landlord/profile"
                    className="flex items-center px-4 py-2 text-sm text-ink hover:bg-paper-card transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-risk-red hover:bg-risk-red-bg transition-colors text-left"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (logout) logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page container */}
        <main
          id="page-container"
          className="flex-1 min-h-0 overflow-y-auto scroll-thin px-10 pt-5 pb-12"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LandlordLayout;
