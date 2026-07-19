import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { 
  FiBookmark, 
  FiMessageSquare, 
  FiUser, 
  FiShield, 
  FiActivity, 
  FiCompass, 
  FiMapPin 
} from 'react-icons/fi';
import apiClient from '../../services/apiClient';

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    bookmarks: 0,
    inquiries: 0,
    locations: 0,
    auditLogs: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch real counts from backend APIs
        const bookmarksRes = await apiClient.get('/api/v1/favorites');
        const inquiriesRes = await apiClient.get('/api/v1/inquiries/history');
        
        let locationsCount = 0;
        let auditLogsCount = 0;

        if (user?.role === 'Admin') {
          const countriesRes = await apiClient.get('/api/v1/locations/countries');
          locationsCount = countriesRes.data.data?.length || 0;
          const auditRes = await apiClient.get('/api/v1/admin/audit-logs', { params: { pageSize: 1, pageNumber: 1 } });
          auditLogsCount = auditRes.data.totalCount || 0;
        }

        setStats({
          bookmarks: bookmarksRes.data.data?.length || 0,
          inquiries: inquiriesRes.data.data?.length || 0,
          locations: locationsCount,
          auditLogs: auditLogsCount
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      }
    };

    fetchDashboardStats();
  }, [user]);

  return (
    <div className="flex flex-col gap-[30px]">
      {/* Welcome Banner */}
      <div className="glass-card animate-fade-in !max-w-full p-[30px] bg-gradient-to-br from-accent-light/15 to-bg-card border border-accent/20">
        <h2 className="text-[28px] text-text-primary mb-2 font-semibold">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h2>
        <p className="text-[15px] text-text-secondary m-0 leading-relaxed">
          Explore luxury properties, keep track of your saved listings, submit inquiries, and manage your user details. 
          {user?.role === 'Admin' && ' You have full administrative credentials to config roles, permissions, geo-locations, and review auditing logs.'}
        </p>
      </div>

      {/* Metrics Stat Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <FiBookmark />
          </div>
          <div className="dashboard-stat-info">
            <h4>Saved Bookmarks</h4>
            <p>{stats.bookmarks}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <FiMessageSquare />
          </div>
          <div className="dashboard-stat-info">
            <h4>Sent Inquiries</h4>
            <p>{stats.inquiries}</p>
          </div>
        </div>

        {user?.role === 'Admin' ? (
          <>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <FiMapPin />
              </div>
              <div className="dashboard-stat-info">
                <h4>Registered Locations</h4>
                <p>{stats.locations}</p>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <FiActivity />
              </div>
              <div className="dashboard-stat-info">
                <h4>System Changes Logged</h4>
                <p>{stats.auditLogs}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <FiCompass />
              </div>
              <div className="dashboard-stat-info">
                <h4>Active Listings</h4>
                <p>1,248</p>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <FiShield />
              </div>
              <div className="dashboard-stat-info">
                <h4>Account Security</h4>
                <p className={`text-base font-semibold ${user?.isVerified ? 'text-success' : 'text-error'}`}>
                  {user?.isVerified ? 'Email Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Account Info and Shortcut Links */}
      <div className="flex flex-wrap gap-[30px] w-full box-border">
        {/* Profile Info Summary */}
        <div className="glass-card flex-[1_1_320px] !max-w-full p-6 box-border">
          <h3 className="text-lg mb-5 border-b border-border pb-2.5">
            Security & Session Details
          </h3>
          <div className="flex flex-col gap-[15px]">
            <div className="flex justify-between items-center gap-2.5 text-sm flex-wrap">
              <span className="text-text-secondary whitespace-nowrap">User ID</span>
              <span className="font-mono break-all text-right">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center gap-2.5 text-sm flex-wrap">
              <span className="text-text-secondary whitespace-nowrap">Email Address</span>
              <span className="break-all text-right">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center gap-2.5 text-sm flex-wrap">
              <span className="text-text-secondary">Identity Role</span>
              <span className="text-accent font-bold">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center gap-2.5 text-sm flex-wrap">
              <span className="text-text-secondary">Verification Status</span>
              <span className={`font-bold ${user?.isVerified ? 'text-success' : 'text-error'}`}>
                {user?.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Portal Action Buttons */}
        <div className="glass-card flex-[1_1_320px] !max-w-full p-6 box-border">
          <h3 className="text-lg mb-5 border-b border-border pb-2.5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            <button 
              className="btn-primary flex items-center justify-center gap-2 p-3" 
              onClick={() => navigate('/profile')} 
            >
              <FiUser /> Edit Profile
            </button>
            <button 
              className="btn-primary flex items-center justify-center gap-2 p-3 !bg-transparent border border-accent text-text-primary" 
              onClick={() => navigate('/bookmarks')} 
            >
              <FiBookmark /> Bookmarks
            </button>
            {user?.role === 'Admin' && (
              <>
                <button 
                  className="btn-primary flex items-center justify-center gap-2 p-3 col-span-2" 
                  onClick={() => navigate('/admin/locations')} 
                >
                  <FiMapPin /> Geolocation Console
                </button>
                <button 
                  className="btn-primary flex items-center justify-center gap-2 p-3 col-span-2 !bg-accent-light border border-accent/30" 
                  onClick={() => navigate('/admin/audit-logs')} 
                >
                  <FiActivity /> Review System Audits
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
