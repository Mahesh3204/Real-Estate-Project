import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Submit Reset
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      setSuccess("If the email is registered, a reset token has been sent.");
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/api/auth/reset-password', {
        email,
        token,
        newPassword,
      });

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || "Invalid reset token or email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2>Reset Password</h2>
      
      {error && <div className="alert-error">{error}</div>}
      {success && <div style={{ padding: '12px', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequestReset}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
            Enter your email address and we'll send you a password reset token.
          </p>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Token"}
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Know your password? </span>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirmReset}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
            Enter the reset token sent to your email and your new password.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="token">Reset Token</label>
            <input
              type="text"
              id="token"
              className="form-input"
              placeholder="Enter your token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="form-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Min 8 chars, 1 uppercase, 1 number, 1 special char.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Update Password"}
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Need to resend? </span>
            <span 
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setStep(1)}
            >
              Go back
            </span>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
