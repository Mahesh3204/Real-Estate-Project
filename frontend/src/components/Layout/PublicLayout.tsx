import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateUser } from '../../store/authSlice';
import { 
  FiHome, 
  FiSearch, 
  FiBookmark, 
  FiLayers, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiChevronDown,
  FiGrid
} from 'react-icons/fi';
import apiClient from '../../services/apiClient';
import { roleApi } from '../../services/roleApi';

const PublicLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getAvatarUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = apiClient.defaults.baseURL || 'http://localhost:5242';
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-text-primary">
              Gentry <span className="text-accent">Estates</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => `text-[15px] font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              Home
            </NavLink>
            <NavLink 
              to="/listings" 
              className={({ isActive }) => `text-[15px] font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              Browse
            </NavLink>
            <NavLink 
              to="/compare" 
              className={({ isActive }) => `text-[15px] font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              Compare
            </NavLink>
            <NavLink 
              to="/bookmarks" 
              className={({ isActive }) => `text-[15px] font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              Favorites
            </NavLink>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              /* Premium Consistent User Profile Dropdown */
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

                    <Link 
                      to="/dashboard" 
                      className="dropdown-menu-link" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiGrid />
                      <span>Portal Dashboard</span>
                    </Link>

                    <Link 
                      to="/profile" 
                      className="dropdown-menu-link" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser />
                      <span>My Profile</span>
                    </Link>

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
                            <span>{roleName} Panel</span>
                            {user.activeRole === roleName && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">Active</span>}
                          </button>
                        ))}
                      </>
                    )}

                    <div className="dropdown-menu-divider" />

                    <button 
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="dropdown-menu-link text-error hover:text-error/80"
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-text-secondary hover:text-accent text-xs font-bold transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-accent hover:bg-accent-hover text-white flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border px-4 py-6 bg-bg-primary/95 flex flex-col gap-4 animate-fade-in">
            <NavLink 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 py-2 text-base font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              <FiHome /> Home
            </NavLink>
            <NavLink 
              to="/listings" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 py-2 text-base font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              <FiSearch /> Browse Properties
            </NavLink>
            <NavLink 
              to="/compare" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 py-2 text-base font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              <FiLayers /> Compare
            </NavLink>
            <NavLink 
              to="/bookmarks" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 py-2 text-base font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}
            >
              <FiBookmark /> Favorites
            </NavLink>
            <div className="border-t border-border/50 my-2" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-1.5 border-b border-border/40 pb-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                    {initials || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-text-secondary">{user.email}</div>
                  </div>
                </div>

                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-base font-medium text-text-secondary hover:text-text-primary"
                >
                  <FiGrid size={16} /> Portal Dashboard
                </Link>

                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-base font-medium text-text-secondary hover:text-text-primary"
                >
                  <FiUser size={16} /> My Profile
                </Link>

                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 py-2 text-base font-medium text-error hover:text-error/80 cursor-pointer w-full text-left"
                >
                  <FiLogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-text-secondary hover:text-accent flex items-center justify-center gap-1.5 py-2 w-full text-sm font-bold border border-border rounded-full cursor-pointer transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-accent hover:bg-accent-hover text-white flex items-center justify-center gap-1.5 py-2 w-full text-sm font-bold rounded-full transition-all cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 box-border">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-heading text-lg font-bold text-text-primary">
              Gentry <span className="text-accent">Estates</span>
            </span>
            <span className="text-xs text-text-secondary">
              © 2026 Gentry Estates. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8 text-sm text-text-secondary">
            <Link to="/listings" className="hover:text-accent transition-colors">Browse</Link>
            <Link to="/compare" className="hover:text-accent transition-colors">Compare</Link>
            <Link to="/login" className="hover:text-accent transition-colors">Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
