import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '50px 30px' }}>
      <div style={{ fontSize: '72px', marginBottom: '20px', color: 'var(--accent)', fontWeight: '800' }}>404</div>
      <h2 style={{ marginBottom: '15px' }}>Lost Your Way Home?</h2>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '35px', lineHeight: '1.6' }}>
        The listing, page, or property resource you are looking for has either been moved, sold, or never existed in our database.
      </p>
      
      <button 
        type="button" 
        className="btn-primary" 
        style={{ maxWidth: '220px', margin: '0 auto' }}
        onClick={() => navigate('/login')}
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotFoundPage;
