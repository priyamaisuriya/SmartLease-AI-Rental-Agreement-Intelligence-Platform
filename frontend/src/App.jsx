import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LandingLayout from './components/layouts/LandingLayout';
import AppLayout from './components/layouts/AppLayout';
import AdminLayout from './components/layouts/AdminLayout';
import LandlordLayout from './components/layouts/LandlordLayout';

import ProtectedRoute from './components/ProtectedRoute';

// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// =====================================================
// TENANT PAGES
// =====================================================

import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Rentals from './pages/Rentals';
import Agreements from './pages/Agreements';
import Analysis from './pages/Analysis';
import Chat from './pages/Chat';
import Reminders from './pages/Reminders';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from './pages/admin/AdminDashboard';
import AiUsage from './pages/admin/AiUsage';
import UsersManagement from './pages/admin/UsersManagement';
import PropertyManagement from './pages/admin/PropertyManagement';
import AdminPropertyDetails from './pages/admin/AdminPropertyDetails';
import RentalRequestsManagement from './pages/admin/RentalRequestsManagement';
import AgreementsManagement from './pages/admin/AgreementsManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import UserDetails from './pages/admin/UserDetails';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminProfile from './pages/admin/AdminProfile';

// =====================================================
// LANDLORD PAGES
// =====================================================

import LandlordDashboard from './pages/landlord/LandlordDashboard';
import MyProperties from './pages/landlord/MyProperties';
import AddProperty from './pages/landlord/AddProperty';
import LandlordPropertyDetails from './pages/landlord/PropertyDetails';
import Tenants from './pages/landlord/Tenants';
import TenantDetails from './pages/landlord/TenantDetails';
import RentalRequests from './pages/landlord/RentalRequests';
import LandlordAgreements from './pages/landlord/Agreements';
import LandlordAgreementUpload from './pages/landlord/Upload';
import AgreementAnalysis from './pages/landlord/AgreementAnalysis';
import AiChat from './pages/landlord/AiChat';
import LandlordReminders from './pages/landlord/Reminders';
import LandlordReports from './pages/landlord/Reports';
import LandlordNotifications from './pages/landlord/Notifications';
import LandlordProfile from './pages/landlord/Profile';
import Settings from './pages/landlord/Settings';


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route element={<LandingLayout />}>
          <Route
            path="/"
            element={<Landing />}
          />
        </Route>

        <Route
          path="/login"
          element={<Auth />}
        />

        <Route
          path="/register"
          element={<Auth />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* =================================================
            TENANT ROUTES
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['tenant']}
            />
          }
        >
          <Route element={<AppLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/properties" element={<Properties />} />

            <Route
              path="/properties/:id"
              element={<PropertyDetails />}
            />

            <Route path="/rentals" element={<Rentals />} />

            <Route path="/agreements" element={<Agreements />} />

            <Route path="/analysis" element={<Analysis />} />

            <Route
              path="/analysis/:agreementId"
              element={<Analysis />}
            />

            <Route path="/chat" element={<Chat />} />

            <Route
              path="/chat/:agreementId"
              element={<Chat />}
            />

            <Route path="/reminders" element={<Reminders />} />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route path="/reports" element={<Reports />} />
            
            <Route path="/feedback" element={<Feedback />} />

            <Route path="/profile" element={<Profile />} />

          </Route>
        </Route>

        {/* =================================================
            ADMIN ROUTES
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* Dashboard */}
            <Route
              index
              element={<AdminDashboard />}
            />

            {/* AI Usage */}
            <Route
              path="ai-usage"
              element={<AiUsage />}
            />

            {/* Users */}
            <Route
              path="users"
              element={<UsersManagement />}
            />

            <Route

              path="users/:id"
              element={<UserDetails />}
            />

            {/* Properties */}
            <Route
              path="properties"
              element={<PropertyManagement />}
            />

            <Route
              path="properties/:id"
              element={<AdminPropertyDetails />}
            />

            {/* Rental Requests */}
            <Route
              path="rental-requests"
              element={<RentalRequestsManagement />}
            />

            {/* Agreements */}
            <Route
              path="agreements"
              element={<AgreementsManagement />}
            />

            {/* Reports */}
            <Route
              path="reports"
              element={<ReportsManagement />}
            />

            {/* Feedback */}
            <Route
              path="feedback"
              element={<FeedbackManagement />}
            />

            {/* Audit Logs */}
            <Route
              path="audit-logs"
              element={<AuditLogs />}
            />

            {/* Notifications */}
            <Route
              path="notifications"
              element={<AdminNotifications />}
            />

            {/* Profile */}
            <Route
              path="profile"
              element={<AdminProfile />}
            />

            {/* Settings */}
            <Route
              path="settings"
              element={<AdminSettings />}
            />

          </Route>
        </Route>

        {/* =================================================
            LANDLORD ROUTES
        ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['landlord']}
            />
          }
        >
          <Route
            path="/landlord"
            element={<LandlordLayout />}
          >

            {/* Dashboard */}
            <Route
              index
              element={<LandlordDashboard />}
            />


            {/* ===============================
                PROPERTIES
            ================================ */}

            <Route
              path="properties"
              element={<MyProperties />}
            />

            <Route
              path="properties/:id"
              element={<LandlordPropertyDetails />}
            />

            <Route
              path="properties/add"
              element={<AddProperty />}
            />


            {/* ===============================
                TENANTS
            ================================ */}

            <Route
              path="tenants"
              element={<Tenants />}
            />

            <Route
              path="tenants/:id"
              element={<TenantDetails />}
            />


            {/* ===============================
                RENTAL REQUESTS
            ================================ */}

            <Route
              path="rental-requests"
              element={<RentalRequests />}
            />


            {/* ===============================
                AGREEMENTS
            ================================ */}

            <Route
              path="agreements"
              element={<LandlordAgreements />}
            />

            <Route
              path="agreements/upload"
              element={<LandlordAgreementUpload />}
            />


            {/* ===============================
                AI ANALYSIS
            ================================ */}

            <Route
              path="analysis"
              element={<AgreementAnalysis />}
            />
            
            <Route
              path="analysis/:agreementId"
              element={<AgreementAnalysis />}
            />


            {/* ===============================
                AI CHAT
            ================================ */}

            <Route
              path="chat"
              element={<AiChat />}
            />

            <Route
              path="chat/:agreementId"
              element={<AiChat />}
            />


            {/* ===============================
                REMINDERS
            ================================ */}

            <Route
              path="reminders"
              element={<LandlordReminders />}
            />


            {/* ===============================
                REPORTS
            ================================ */}

            <Route
              path="reports"
              element={<LandlordReports />}
            />


            {/* ===============================
                NOTIFICATIONS
            ================================ */}

            <Route
              path="notifications"
              element={<LandlordNotifications />}
            />


            {/* ===============================
                FEEDBACK
            ================================ */}

            <Route
              path="feedback"
              element={<Feedback />}
            />


            {/* ===============================
                PROFILE
            ================================ */}

            <Route
              path="profile"
              element={<LandlordProfile />}
            />


            {/* ===============================
                SETTINGS
            ================================ */}

            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>
        </Route>

        {/* =================================================
            FALLBACK
        ================================================== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;