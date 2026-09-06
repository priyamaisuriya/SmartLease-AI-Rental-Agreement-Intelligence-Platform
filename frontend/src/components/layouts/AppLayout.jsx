import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Home,
  FileText,
  MessageSquare,
  Bell,
  FileBarChart,
  User,
  Menu,
  X,
  LogOut,
  FileSearch,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  {
    id: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'Overview',
  },
  {
    id: '/properties',
    label: 'Find Properties',
    icon: Search,
    section: 'Find & Rent',
  },
  {
    id: '/rentals',
    label: 'My Rentals',
    icon: Home,
    section: 'Find & Rent',
  },
  {
    id: '/agreements',
    label: 'My Agreements',
    icon: FileText,
    section: 'Agreements',
  },
  {
    id: '/analysis',
    label: 'AI Analysis',
    icon: FileSearch,
    section: 'Agreements',
  },
  {
    id: '/chat',
    label: 'AI Chat',
    icon: MessageSquare,
    section: 'Agreements',
  },
  {
    id: '/reminders',
    label: 'Reminders',
    icon: Bell,
    section: 'Agreements',
  },
  {
    id: '/notifications',
    label: 'Notifications',
    icon: Bell,
    badge: '4',
    section: 'Account',
  },
  {
    id: '/reports',
    label: 'Reports',
    icon: FileBarChart,
    section: 'Account',
  },
  {
    id: '/feedback',
    label: 'Feedback',
    icon: MessageSquare,
    section: 'Account',
  },
  {
    id: '/profile',
    label: 'Profile / Settings',
    icon: User,
    section: 'Account',
  },
];

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Agreement Ready to Sign',
      message: 'Your rental agreement for "Furnished 1BHK" is ready.',
      time: '1 hour ago'
    },
    {
      id: 2,
      title: 'Request Approved',
      message: 'Your rental request for "kkk" was approved.',
      time: '1 day ago'
    }
  ]);

  const location = useLocation();
  const { user, logout } = useAuth();

  const sections = Array.from(
    new Set(NAV_ITEMS.map((item) => item.section))
  );

  const currentItem =
    NAV_ITEMS.find(
      (item) =>
        location.pathname === item.id ||
        location.pathname.startsWith(item.id + '/')
    ) || NAV_ITEMS[0];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const getInitial = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const displayName = user?.name || 'Tenant';
  const displayRole =
    user?.role === 'tenant'
      ? 'Tenant'
      : user?.role || 'User';

  return (
    <div
      id="app-shell"
      className="flex min-h-screen bg-paper overflow-hidden font-sans text-ink"
    >
      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-gradient-to-b from-ink-dark to-[#101a2e] lg:flex px-[18px] py-[28px]">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-[34px]">
          <div className="w-[34px] h-[34px] rounded-[3px] border border-gold flex items-center justify-center bg-gold/5 shrink-0">
            <span className="font-serif font-bold text-gold text-lg">
              S
            </span>
          </div>

          <span className="text-[13px] tracking-[0.14em] uppercase text-[#EDEBE3] font-semibold">
            SmartLease <span className="text-gold">AI</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="scroll-thin flex-1 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-[22px]">

              <div className="text-[10.5px] uppercase tracking-[0.12em] text-ink-muted px-3 mb-2 font-semibold">
                {section}
              </div>

              <div className="space-y-[2px]">
                {NAV_ITEMS
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.id}
                      className={({ isActive }) =>
                        `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${
                          isActive
                            ? 'bg-gold/12 text-gold-soft font-semibold'
                            : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'
                        }`
                      }
                    >
                      <item.icon
                        className="w-4 h-4 shrink-0"
                        strokeWidth={1.6}
                      />

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

        {/* Desktop User */}
        <div className="mt-auto pt-4 border-t border-ink-line flex items-center gap-2.5 px-2">

          <div className="w-8 h-8 rounded-full bg-gold text-ink-dark flex items-center justify-center text-[13px] font-bold font-serif shrink-0">
            {getInitial()}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">
              {displayName}
            </div>

            <div className="text-[11px] text-ink-muted block">
              {displayRole}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto"
            title="Logout"
          >
            <LogOut className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer" />
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-dark/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] flex-col bg-gradient-to-b from-ink-dark to-[#101a2e] flex transition-transform duration-300 lg:hidden px-[18px] py-[28px] ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        {/* Mobile Logo */}
        <div className="flex items-center justify-between px-2 mb-[34px]">

          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[3px] border border-gold flex items-center justify-center bg-gold/5 shrink-0">
              <span className="font-serif font-bold text-gold text-lg">
                S
              </span>
            </div>

            <span className="text-[13px] tracking-[0.14em] uppercase text-[#EDEBE3] font-semibold">
              SmartLease <span className="text-gold">AI</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-ink-faint hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="scroll-thin flex-1 overflow-y-auto">

          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-[22px]">

              <div className="text-[10.5px] uppercase tracking-[0.12em] text-ink-muted px-3 mb-2 font-semibold">
                {section}
              </div>

              <div className="space-y-[2px]">

                {NAV_ITEMS
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.id}
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                      className={({ isActive }) =>
                        `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${
                          isActive
                            ? 'bg-gold/12 text-gold-soft font-semibold'
                            : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'
                        }`
                      }
                    >
                      <item.icon
                        className="w-4 h-4 shrink-0"
                        strokeWidth={1.6}
                      />

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

        {/* Mobile User */}
        <div className="mt-auto pt-4 border-t border-ink-line flex items-center gap-2.5 px-2">

          <div className="w-8 h-8 rounded-full bg-gold text-ink-dark flex items-center justify-center text-[13px] font-bold font-serif shrink-0">
            {getInitial()}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">
              {displayName}
            </div>

            <div className="text-[11px] text-ink-muted block">
              {displayRole}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto" />
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">

        {/* Topbar */}
        <header className="px-10 pt-[26px] flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 -ml-2 text-ink lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">

            {/* Notification */}
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
                    <Link to="/notifications" onClick={() => setNotificationsOpen(false)} className="text-xs font-medium text-lease-600 hover:text-lease-700">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">

              <button
                type="button"
                className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-serif text-sm font-bold shadow-sm ml-2 cursor-pointer hover:bg-ink-dark transition-colors"
                onClick={() =>
                  setProfileDropdownOpen(
                    !profileDropdownOpen
                  )
                }
              >
                {getInitial()}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border py-1 z-50">

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-ink hover:bg-paper-card transition-colors"
                    onClick={() =>
                      setProfileDropdownOpen(false)
                    }
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-sm text-risk-red hover:bg-risk-red-bg transition-colors text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main
          id="page-container"
          className="flex-1 overflow-y-auto scroll-thin px-10 pt-5 pb-12"
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AppLayout;