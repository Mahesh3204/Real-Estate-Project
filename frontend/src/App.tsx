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

const App: React.FC = () => {
  return (
    <Router>
      <Loader />
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/inquiry-history" element={<InquiryHistoryPage />} />
        <Route path="/bookmarks" element={<FavoritesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/internal-server-error" element={<ServerErrorPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
