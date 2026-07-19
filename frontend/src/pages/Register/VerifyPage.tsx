import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const VerifyPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = (location.state as { userId?: string; email?: string }) || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!userId) {
      setError("Missing user details. Please register again.");
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/auth/verify', {
        userId,
        otpCode,
      });

      setSuccess("Account verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="glass-card animate-fade-in">
        <h2>Verify Account</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        We have sent a verification code to <strong>{email || "your email"}</strong>.
      </p>

      {error && <div className="alert-error">{error}</div>}
      {success && <div style={{ padding: '12px', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '25px' }}>
          <label className="form-label" htmlFor="otp">One-Time Password (OTP)</label>
          <input
            type="text"
            id="otp"
            className="form-input"
            placeholder="123456"
            maxLength={6}
            style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  </div>
);
};

export default VerifyPage;
