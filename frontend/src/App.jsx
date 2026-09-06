import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingLayout from './components/layouts/LandingLayout';
import AppLayout from './components/layouts/AppLayout';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Requests from './pages/Requests';
import Rentals from './pages/Rentals';
import Agreements from './pages/Agreements';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Chat from './pages/Chat';
import Reminders from './pages/Reminders';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AiUsage from './pages/admin/AiUsage';
import UsersManagement from './pages/admin/UsersManagement';
import PropertyManagement from './pages/admin/PropertyManagement';
import RentalRequestsManagement from './pages/admin/RentalRequestsManagement';
import AgreementsManagement from './pages/admin/AgreementsManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import UserDetails from './pages/admin/UserDetails';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminProfile from './pages/admin/AdminProfile';

// Landlord Pages
import LandlordLayout from './components/layouts/LandlordLayout';
import LandlordDashboard from './pages/landlord/LandlordDashboard';
import MyProperties from './pages/landlord/MyProperties';
import AddProperty from './pages/landlord/AddProperty';
import Tenants from './pages/landlord/Tenants';
import TenantDetails from './pages/landlord/TenantDetails';
import RentalRequests from './pages/landlord/RentalRequests';
import LandlordAgreements from './pages/landlord/Agreements';
import AgreementAnalysis from './pages/landlord/AgreementAnalysis';
import AiChat from './pages/landlord/AiChat';
import LandlordReminders from './pages/landlord/Reminders';
import LandlordReports from './pages/landlord/Reports';
import LandlordNotifications from './pages/landlord/Notifications';
import LandlordProfile from './pages/landlord/Profile';
import Settings from './pages/landlord/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/agreements" element={<Agreements />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="ai-usage" element={<AiUsage />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="properties" element={<PropertyManagement />} />
          <Route path="rental-requests" element={<RentalRequestsManagement />} />
          <Route path="agreements" element={<AgreementsManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          
          {/* Detail & System Pages */}
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/landlord" element={<LandlordLayout />}>
          <Route index element={<LandlordDashboard />} />
          <Route path="properties" element={<MyProperties />} />
          <Route path="properties/add" element={<AddProperty />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/:id" element={<TenantDetails />} />
          <Route path="rental-requests" element={<RentalRequests />} />
          <Route path="agreements" element={<LandlordAgreements />} />
          <Route path="analysis/:agreementId" element={<AgreementAnalysis />} />
          <Route path="chat" element={<AiChat />} />
          <Route path="chat/:agreementId" element={<AiChat />} />
          <Route path="reminders" element={<LandlordReminders />} />
          <Route path="reports" element={<LandlordReports />} />
          <Route path="notifications" element={<LandlordNotifications />} />
          <Route path="profile" element={<LandlordProfile />} />
          <Route path="settings" element={<Settings />} />
          {/* Additional landlord routes will go here */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
