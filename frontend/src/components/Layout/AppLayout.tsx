import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateUser } from '../../store/authSlice';
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
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiUsers,
  FiList,
  FiHome
} from 'react-icons/fi';
import apiClient from '../../services/apiClient';
import { roleApi } from '../../services/roleApi';
import NotificationDropdown from './NotificationDropdown';

const AppLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMarketplaceExpanded, setIsMarketplaceExpanded] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(() => {
    return location.pathname.startsWith('/admin/');
  });

  // Auto-expand admin accordion if admin path is accessed
  useEffect(() => {
    if (location.pathname.startsWith('/admin/')) {
      setIsAdminExpanded(true);
    }
  }, [location.pathname]);

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
    if (path === '/inquiries') return 'Inquiry Inbox';
    if (path === '/appointments') return 'Appointments';
    if (path === '/messenger') return 'Messenger';
    if (path === '/negotiations') return 'Offer Negotiations';
    if (path === '/notifications') return 'Notifications';
    if (path === '/admin/roles') return 'Roles Configuration';
    if (path === '/admin/permissions') return 'System Access Keys';
    if (path === '/admin/locations') return 'Locations Management';
    if (path === '/admin/master-data') return 'Property Options Master Data';
    if (path === '/admin/users') return 'User Management Console';
    if (path === '/admin/role-requests') return 'Role Upgrade Requests Moderation';
    if (path === '/admin/settings') return 'Platform System Settings';
    if (path === '/properties') return 'Properties Workspace';
    if (path === '/properties/wizard') return 'Property Wizard';
    if (path.startsWith('/properties/view')) return 'Property Details';
    if (path === '/admin/properties') return 'Moderate Listings';
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
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="app-sidebar-logo flex justify-between items-center px-4">
          <Link to="/" className="flex items-center gap-2 cursor-pointer no-underline">
            <span className="logo-emblem">GE</span>
            <h3 className={isSidebarCollapsed ? 'hidden' : ''}>Gentry Estates</h3>
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-white/5 cursor-pointer transition-colors"
          >
            {isSidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        <nav className="app-sidebar-nav">
          {/* Marketplace Collapsible Accordion */}
          <div className="flex flex-col">
            <button 
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                }
                setIsMarketplaceExpanded(!isMarketplaceExpanded);
              }}
              className="app-sidebar-link flex items-center justify-between cursor-pointer w-full text-left outline-none"
            >
              <div className="flex items-center gap-2.5">
                <FiHome className="app-sidebar-link-icon" />
                <span>Marketplace</span>
              </div>
              <FiChevronDown 
                className={`accordion-chevron transition-transform duration-200 ${isMarketplaceExpanded ? 'transform rotate-180' : ''}`} 
                size={16} 
              />
            </button>
            
            {isMarketplaceExpanded && !isSidebarCollapsed && (
              <div className="pl-4 flex flex-col gap-2 mt-2 border-l border-border/20 ml-5 animate-fade-in">
                <NavLink 
                  to="/listings" 
                  className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <FiList className="app-sidebar-link-icon" />
                  <span>Browse Properties</span>
                </NavLink>

                <NavLink 
                  to="/compare" 
                  className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <FiSliders className="app-sidebar-link-icon" />
                  <span>Compare</span>
                </NavLink>

                <NavLink 
                  to="/bookmarks" 
                  className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <FiBookmark className="app-sidebar-link-icon" />
                  <span>Favorites</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiGrid className="app-sidebar-link-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/properties" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiBookmark className="app-sidebar-link-icon" />
            <span>Properties</span>
          </NavLink>

          <NavLink 
            to="/inquiry-history" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiMessageSquare className="app-sidebar-link-icon" />
            <span>Inquiries</span>
          </NavLink>

          <NavLink 
            to="/appointments" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiMessageSquare className="app-sidebar-link-icon" />
            <span>Appointments</span>
          </NavLink>

          <NavLink 
            to="/messenger" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiMessageSquare className="app-sidebar-link-icon" />
            <span>Messenger</span>
          </NavLink>

          <NavLink 
            to="/negotiations" 
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiMessageSquare className="app-sidebar-link-icon" />
            <span>Negotiations</span>
          </NavLink>

          {/* Collapsible Admin Console Accordion */}
          {(user?.activeRole === 'Admin' || (!user?.activeRole && user?.role === 'Admin')) && (
            <div className="flex flex-col">
              <button 
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                  }
                  setIsAdminExpanded(!isAdminExpanded);
                }}
                className="app-sidebar-link flex items-center justify-between cursor-pointer w-full text-left outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <FiShield className="app-sidebar-link-icon" />
                  <span>Admin Console</span>
                </div>
                <FiChevronDown 
                  className={`accordion-chevron transition-transform duration-200 ${isAdminExpanded ? 'transform rotate-180' : ''}`} 
                  size={16} 
                />
              </button>
              
              {isAdminExpanded && !isSidebarCollapsed && (
                <div className="pl-4 flex flex-col gap-2 mt-2 border-l border-border/20 ml-5 animate-fade-in">
                  <NavLink 
                    to="/admin/users" 
                    className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FiUsers className="app-sidebar-link-icon" />
                    <span>Users</span>
                  </NavLink>

                  <NavLink 
                    to="/admin/role-requests" 
                    className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FiList className="app-sidebar-link-icon" />
                    <span>Role Requests</span>
                  </NavLink>

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
                    to="/admin/properties" 
                    className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FiSliders className="app-sidebar-link-icon" />
                    <span>Moderate Listings</span>
                  </NavLink>

                  <NavLink 
                    to="/admin/audit-logs" 
                    className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FiActivity className="app-sidebar-link-icon" />
                    <span>Audit Logs</span>
                  </NavLink>

                  <NavLink 
                    to="/admin/settings" 
                    className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <FiSettings className="app-sidebar-link-icon" />
                    <span>Platform Settings</span>
                  </NavLink>
                </div>
              )}
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationDropdown />
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

                {user?.assignedRoles && user.assignedRoles.length > 1 && (
                  <>
                    <div className="dropdown-menu-divider" />
                    <div className="dropdown-section-title" style={{ padding: '6px 12px 2px 12px', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Workspace</div>
                    {user.assignedRoles.map((roleName) => (
                      <button
                        key={roleName}
                        type="button"
                        className={`dropdown-menu-link ${user.activeRole === roleName ? 'active' : ''}`}
                        onClick={async () => {
                          if (user.activeRole !== roleName) {
                            try {
                              const res = await roleApi.switchActiveRole(roleName);
                              if (res.data?.token) {
                                localStorage.setItem('accessToken', res.data.token);
                              }
                              dispatch(updateUser({ activeRole: roleName }));
                              if (roleName === 'Admin') {
                                navigate('/admin/properties');
                              } else if (roleName === 'Seller' || roleName === 'Agent') {
                                navigate('/properties');
                              } else {
                                navigate('/dashboard');
                              }
                            } catch (err) {
                              console.error("Failed to switch active role", err);
                            }
                          }
                          setDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          fontWeight: user.activeRole === roleName ? 'bold' : 'normal',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiShield style={{ color: user.activeRole === roleName ? 'var(--primary)' : 'var(--text-secondary)' }} />
                          <span>{roleName} Portal</span>
                        </div>
                        {user.activeRole === roleName && <span style={{ color: 'var(--success)', fontSize: '12px' }}>●</span>}
                      </button>
                    ))}
                  </>
                )}

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
