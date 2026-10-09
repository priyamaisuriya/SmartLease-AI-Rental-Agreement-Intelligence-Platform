import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Users, Building, FileText, Inbox, BarChart, ShieldAlert, Activity, FileBarChart, Settings, Bell, MessageSquare, Search, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NAV_ITEMS = [
  { id: '/admin', label: 'Dashboard', icon: LayoutDashboard, section: 'Main', permission: 'dashboard' },
  { id: '/admin/users', label: 'Users', icon: Users, section: 'Management', permission: 'tenant-management' }, // using tenant-management as a proxy for user management
  { id: '/admin/properties', label: 'Properties', icon: Building, section: 'Management', permission: 'property-view' },
  { id: '/admin/rental-requests', label: 'Rental Requests', icon: Inbox, section: 'Management', permission: 'rental-view' },
  { id: '/admin/agreements', label: 'Agreements', icon: FileText, section: 'Management', permission: 'agreement-view' },
  { id: '/admin/ai-usage', label: 'AI Usage', icon: Activity, section: 'AI & Reports', permission: 'reports' },
  { id: '/admin/reports', label: 'Reports', icon: BarChart, section: 'AI & Reports', permission: 'reports' },
  { id: '/admin/feedback', label: 'Feedback', icon: MessageSquare, section: 'AI & Reports', permission: 'feedback' },
  { id: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert, section: 'System', permission: 'settings' },
  { id: '/admin/permissions', label: 'Permissions', icon: Shield, section: 'System', permission: 'permission-management' },
  { id: '/admin/notifications', label: 'Notifications', icon: Bell, section: 'System', permission: null },
  { id: '/admin/profile', label: 'Profile', icon: Users, section: 'Account', permission: 'profile' },
  { id: '/admin/settings', label: 'Settings', icon: Settings, section: 'Account', permission: 'settings' },
];

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  // Load on mount and refresh every minute.
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Sidebar badge: the real unread notification count.
  const badgeFor = (item) =>
    item.id === '/admin/notifications' && unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null;

  const markNotificationRead = async (n) => {
    if (n.isRead) return;
    try {
      await api.patch(`/notifications/${n._id}/read`);
      setNotifications((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((list) => list.filter((x) => x._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const location = useLocation();

  const { user, logout } = useAuth();
  
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await api.get('/permissions/my-role');
        setUserPermissions(res.data.permissions || []);
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      } finally {
        setPermissionsLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const getInitial = () => {
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  // Filter NAV_ITEMS based on permissions
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!item.permission) return true; // Items without specific permission requirement
    if (user?.role === 'admin') return true; // Admin gets everything
    return userPermissions.includes(item.permission);
  });

  // Group nav items by section for the sidebar
  const sections = Array.from(new Set(filteredNavItems.map(item => item.section)));

  const currentItem = filteredNavItems.find(item => location.pathname === item.id || location.pathname.startsWith(item.id + '/')) || filteredNavItems[0];
  const pageTitle = currentItem?.label || 'Admin';
  const eyebrow = currentItem?.section || '';

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
                {filteredNavItems.filter(item => item.section === section).map(item => (
                  <NavLink key={item.id} to={item.id} end={item.id === '/admin'} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                    {item.label}
                    {badgeFor(item) && (
                      <span className="ml-auto text-[10.5px] bg-[#C1443C] text-white px-[6px] py-[1px] rounded-[10px] font-semibold">
                        {badgeFor(item)}
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
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">{user?.name || 'Admin User'}</div>
            <div className="text-[11px] text-ink-muted block capitalize">{user?.role || 'Super Admin'}</div>
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
                {filteredNavItems.filter(item => item.section === section).map(item => (
                  <NavLink key={item.id} to={item.id} end={item.id === '/admin'} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-[11px] px-3 py-[9px] rounded-[4px] text-[13.5px] font-medium transition-colors w-full ${isActive ? 'bg-gold/12 text-gold-soft font-semibold' : 'text-ink-faint hover:bg-white/5 hover:text-[#EDEBE3]'}`}>
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                    {item.label}
                    {badgeFor(item) && (
                      <span className="ml-auto text-[10.5px] bg-[#C1443C] text-white px-[6px] py-[1px] rounded-[10px] font-semibold">
                        {badgeFor(item)}
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
            <div className="text-[13px] font-semibold text-[#EDEBE3] truncate">{user?.name || 'Admin User'}</div>
            <div className="text-[11px] text-ink-muted block capitalize">{user?.role || 'Super Admin'}</div>
          </div>
          <LogOut className="w-[15px] h-[15px] text-ink-muted hover:text-white cursor-pointer ml-auto" onClick={() => setMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
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
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-risk-amber rounded-full border-2 border-paper"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-ink">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-text-muted hover:text-risk-red transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto scroll-thin">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map(n => (
                        <div key={n._id} onClick={() => markNotificationRead(n)} className={`group relative px-4 py-3 border-b border-border hover:bg-paper-card cursor-pointer transition-colors pr-10 ${n.isRead ? '' : 'bg-lease-50/40'}`}>
                          <p className={`text-sm text-ink ${n.isRead ? '' : 'font-semibold'}`}>{n.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-text-faint mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n._id);
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
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-border text-center">
                    <Link to="/admin/notifications" onClick={() => setNotificationsOpen(false)} className="text-xs font-medium text-lease-600 hover:text-lease-700">View all notifications</Link>
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
                    to="/admin/profile"
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
        <main id="page-container" className="flex-1 overflow-y-auto scroll-thin px-10 pt-5 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
