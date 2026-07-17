import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type UserSession } from '../../store/authStore';
import apiClient from '../../services/apiClient';

const ProfilePage: React.FC = () => {
  const { user, logout, login } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhoneNumber((user as any).phoneNumber || '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.put('/api/user/profile', {
        userId: user?.id,
        firstName,
        lastName,
        phoneNumber,
      });

      // Update session store state
      const updatedUser: UserSession = {
        ...user!,
        firstName,
        lastName,
        phoneNumber,
      } as any;
      
      login(updatedUser, localStorage.getItem('accessToken') || '');
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card">
        <p>Access Denied. Please log in first.</p>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            color: 'var(--accent)',
            border: '2px solid var(--accent)'
          }}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '20px' }}>{user.firstName} {user.lastName}</h2>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '20px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              {user.role}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            to="/inquiry-history" 
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}
          >
            Inquiries
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <Link 
            to="/bookmarks" 
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}
          >
            Bookmarks
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <Link 
            to="/compare" 
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}
          >
            Compare
          </Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div style={{ padding: '10px 14px', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'left' }}>{success}</div>}

      {!isEditing ? (
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Email Address</span>
            <strong>{user.email}</strong>
          </div>
          <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Phone Number</span>
            <strong>{phoneNumber || 'Not provided'}</strong>
          </div>
          <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
            <strong style={{ color: user.isVerified ? 'var(--success)' : 'var(--error)' }}>
              {user.isVerified ? '✓ Verified' : '⚠ Unverified'}
            </strong>
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: '25px', marginBottom: '12px' }} 
            onClick={() => setIsEditing(true)}
          >
            Edit Profile Details
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} style={{ textAlign: 'left', marginBottom: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              className="form-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)' }}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <button 
        className="btn-primary" 
        style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)', width: '100%' }} 
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
