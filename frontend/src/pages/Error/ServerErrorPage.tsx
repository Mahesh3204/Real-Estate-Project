import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '50px 30px' }}>
      <div style={{ fontSize: '72px', marginBottom: '20px', color: 'var(--error)', fontWeight: '800' }}>500</div>
      <h2 style={{ marginBottom: '15px' }}>Something Went Wrong</h2>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '35px', lineHeight: '1.6' }}>
        Our server encountered an unexpected error. Please try again later or return to the main login portal.
      </p>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn-primary"
          style={{ maxWidth: '180px' }}
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
        <button
          type="button"
          className="btn-primary"
          style={{ maxWidth: '180px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)' }}
          onClick={handleGoToLogin}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ServerErrorPage;
