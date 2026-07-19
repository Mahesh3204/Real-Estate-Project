import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Roles', path: '/admin/roles' },
    { name: 'Permissions', path: '/admin/permissions' },
    { name: 'Locations', path: '/admin/locations' },
    { name: 'Property Master Data', path: '/admin/master-data' },
    { name: 'Audit Logs', path: '/admin/audit-logs' },
    { name: 'User Profile', path: '/profile' }
  ];

  return (
    <div style={{
      width: '260px',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border)',
      minHeight: '100vh',
      padding: '30px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      flexShrink: 0
    }}>
      <div>
        <h3 style={{
          color: 'var(--text-primary)',
          fontSize: '22px',
          fontWeight: '700',
          fontFamily: 'var(--heading)',
          background: 'linear-gradient(to right, #fff, var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '5px'
        }}>
          Real Estate
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>
          ADMIN CONSOLE
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '14px 18px',
                borderRadius: '12px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                border: isActive ? '1px solid rgba(183, 94, 255, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px',
                transition: 'all 0.3s ease'
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
