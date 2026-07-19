import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { 
  FiGrid, 
  FiUser, 
  FiBookmark, 
  FiMessageSquare, 
  FiShield, 
  FiKey, 
  FiMapPin, 
  FiSettings, 
  FiActivity, 
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';
import apiClient from '../../services/apiClient';

const AppLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/profile') return 'User Profile';
    if (path === '/bookmarks') return 'Bookmarked Properties';
    if (path === '/inquiry-history') return 'Inquiries Feed';
    if (path === '/admin/roles') return 'Roles Configuration';
    if (path === '/admin/permissions') return 'System Access Keys';
    if (path === '/admin/locations') return 'Locations Management';
    if (path === '/admin/master-data') return 'Property Options Master Data';
    if (path === '/admin/audit-logs') return 'System Activity Log Trails';
    return 'Real Estate Portal';
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = apiClient.defaults.baseURL || 'http://localhost:5242';
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="app-layout">
      {/* Sidebar Section */}
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <h3>Gentry Estates</h3>
        </div>

        <nav className="app-sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiGrid className="app-sidebar-link-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/inquiry-history" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiMessageSquare className="app-sidebar-link-icon" />
            <span>Inquiries</span>
          </NavLink>


          {/* Admin console section - only visible to admins */}
          {user?.role === 'Admin' && (
            <>
              <div className="app-sidebar-section-title">Admin Console</div>
              
              <NavLink 
                to="/admin/roles" 
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FiShield className="app-sidebar-link-icon" />
                <span>Roles</span>
              </NavLink>

              <NavLink 
                to="/admin/permissions" 
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FiKey className="app-sidebar-link-icon" />
                <span>Permissions</span>
              </NavLink>

              <NavLink 
                to="/admin/locations" 
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FiMapPin className="app-sidebar-link-icon" />
                <span>Locations</span>
              </NavLink>

              <NavLink 
                to="/admin/master-data" 
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FiSettings className="app-sidebar-link-icon" />
                <span>Property Options</span>
              </NavLink>

              <NavLink 
                to="/admin/audit-logs" 
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FiActivity className="app-sidebar-link-icon" />
                <span>Audit Logs</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Panel Area */}
      <div className="app-main-content">
        {/* Top Navbar */}
        <header className="app-navbar">
          <div className="app-navbar-title">
            {getPageTitle()}
          </div>

          {/* User Profile Toggler */}
          <div className="navbar-user-dropdown" ref={dropdownRef}>
            <button 
              type="button" 
              className="navbar-avatar-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.profilePictureUrl ? (
                <img 
                  src={getAvatarUrl(user.profilePictureUrl)} 
                  alt="Profile" 
                  className="navbar-avatar-img"
                />
              ) : (
                <div className="navbar-avatar-placeholder">
                  {initials || 'U'}
                </div>
              )}
              <FiChevronDown style={{ color: 'var(--text-secondary)' }} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu-card">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user?.firstName} {user?.lastName}</div>
                  <div className="dropdown-user-email">{user?.email}</div>
                </div>

                <NavLink 
                  to="/profile" 
                  className="dropdown-menu-link" 
                  onClick={() => setDropdownOpen(false)}
                >
                  <FiUser />
                  <span>My Profile</span>
                </NavLink>

                <NavLink 
                  to="/bookmarks" 
                  className="dropdown-menu-link" 
                  onClick={() => setDropdownOpen(false)}
                >
                  <FiBookmark />
                  <span>Saved Bookmarks</span>
                </NavLink>

                <div className="dropdown-menu-divider" />

                <button 
                  type="button" 
                  className="dropdown-menu-link" 
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  style={{ color: 'var(--error)' }}
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Inner Content Container */}
        <main className="app-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
