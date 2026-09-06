import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Search, Home, FileText, Upload, MessageSquare, Bell, FileBarChart, User, Menu, X, LogOut, FileSearch, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  { id:'/dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'/properties', label:'Find Properties', icon:Search },
  { id:'/requests', label:'My Rental Requests', icon:HelpCircle },
  { id:'/rentals', label:'My Rentals', icon:Home },
  { id:'/agreements', label:'My Agreements', icon:FileText },
  { id:'/upload', label:'Analyze Agreement', icon:Upload },
  { id:'/analysis', label:'AI Analysis', icon:FileSearch },
  { id:'/chat', label:'AI Chat', icon:MessageSquare },
  { id:'/reminders', label:'Reminders', icon:Bell },
  { id:'/notifications', label:'Notifications', icon:Bell },
  { id:'/reports', label:'Reports', icon:FileBarChart },
  { id:'/profile', label:'Profile / Settings', icon:User },
];

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div id="app-shell" className="bg-canvas">
      <div className="mx-auto flex max-w-[1440px]">

        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
          <Link to="/" className="flex items-center gap-2 px-6 py-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lease-600 text-white font-display font-bold">S</span>
            <span className="font-display text-lg font-semibold text-ink">SmartLease <span className="text-lease-600">AI</span></span>
          </Link>
          <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-6">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.id} to={item.id} className={({isActive}) => `nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-canvas ${isActive ? 'active-link' : 'text-ink-soft'}`}>
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <Link to="/" className="nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas">
              <LogOut size={18} />
              Logout
            </Link>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-ink/30" onClick={() => setMobileMenuOpen(false)}></div>
        )}
        <aside className={`sidebar-drawer fixed inset-y-0 left-0 z-50 w-72 flex-col bg-surface lg:hidden flex transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-lease-600 text-white font-display font-bold">S</span>
              <span className="font-display text-lg font-semibold text-ink">SmartLease <span className="text-lease-600">AI</span></span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-canvas">
              <X size={18} />
            </button>
          </div>
          <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-6">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.id} to={item.id} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-canvas ${isActive ? 'active-link' : 'text-ink-soft'}`}>
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <Link to="/" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas">
              <LogOut size={18} />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-h-screen flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-5 py-3.5 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft hover:bg-canvas lg:hidden">
                <Menu size={18} />
              </button>
              <div className="hidden items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 sm:flex">
                <Search size={16} className="text-ink-faint" />
                <input className="w-56 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none" placeholder="Search properties, agreements…" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft hover:bg-canvas">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-bad-500 text-[9px] font-semibold text-white">2</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 rounded-lg border border-line py-1.5 pl-1.5 pr-3 hover:bg-canvas">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-signal-100 text-xs font-semibold text-signal-600">AR</span>
                <span className="hidden text-sm font-medium text-ink sm:block">Ananya</span>
              </Link>
            </div>
          </header>

          {/* Page container */}
          <main id="page-container" className="px-5 py-7 sm:px-8 max-w-[100vw] lg:max-w-[calc(1440px-256px)]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
