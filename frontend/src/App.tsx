import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import VerifyPage from './pages/Register/VerifyPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';
import InquiryHistoryPage from './pages/Profile/InquiryHistoryPage';
import FavoritesPage from './pages/Profile/FavoritesPage';
import ComparePage from './pages/Compare/ComparePage';
import Loader from './components/Common/Loader';
import Toast from './components/Common/Toast';
import NotFoundPage from './pages/Error/NotFoundPage';
import ServerErrorPage from './pages/Error/ServerErrorPage';

// Common Layout & Protection
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';

// Admin pages
import AdminRolesPage from './pages/Admin/AdminRolesPage';
import AdminPermissionsPage from './pages/Admin/AdminPermissionsPage';
import AdminLocationsPage from './pages/Admin/AdminLocationsPage';
import AdminMasterDataPage from './pages/Admin/AdminMasterDataPage';
import AdminAuditLogsPage from './pages/Admin/AdminAuditLogsPage';
import AdminPropertiesPage from './pages/Admin/AdminPropertiesPage';
import AdminRoleRequestsPage from './pages/Admin/AdminRoleRequestsPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import UserManagementPage from './pages/Admin/UserManagementPage';

// Property pages
import PropertyListPage from './pages/Property/PropertyListPage';
import PropertyWizardPage from './pages/Property/PropertyWizardPage';
import PropertyDetailsPage from './pages/Property/PropertyDetailsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Loader />
      <Toast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/compare" element={<ComparePage />} />
        
        {/* Protected App Layout Wrapper */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bookmarks" element={<FavoritesPage />} />
          <Route path="/inquiry-history" element={<InquiryHistoryPage />} />
          
          {/* Property workspace routes */}
          <Route path="/properties" element={<ProtectedRoute allowedRoles={['Seller', 'Agent', 'Admin', 'Buyer']}><PropertyListPage /></ProtectedRoute>} />
          <Route path="/properties/wizard" element={<ProtectedRoute allowedRoles={['Seller', 'Agent', 'Admin']}><PropertyWizardPage /></ProtectedRoute>} />
          <Route path="/properties/view/:slugOrId" element={<ProtectedRoute allowedRoles={['Seller', 'Agent', 'Admin', 'Buyer']}><PropertyDetailsPage /></ProtectedRoute>} />
          
          {/* Admin panel routes */}
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['Admin']}><AdminRolesPage /></ProtectedRoute>} />
          <Route path="/admin/permissions" element={<ProtectedRoute allowedRoles={['Admin']}><AdminPermissionsPage /></ProtectedRoute>} />
          <Route path="/admin/locations" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLocationsPage /></ProtectedRoute>} />
          <Route path="/admin/master-data" element={<ProtectedRoute allowedRoles={['Admin']}><AdminMasterDataPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['Admin']}><AdminAuditLogsPage /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={['Admin']}><AdminPropertiesPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/role-requests" element={<ProtectedRoute allowedRoles={['Admin']}><AdminRoleRequestsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['Admin']}><AdminSettingsPage /></ProtectedRoute>} />
        </Route>

        {/* Redirect Root / to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/internal-server-error" element={<ServerErrorPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

