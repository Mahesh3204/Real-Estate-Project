import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuthStore, type UserSession } from '../../store/authStore';
import GoogleLoginButton from '../../components/Auth/GoogleLoginButton';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Buyer'); // Role selected for Google SSO login fallback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      // Save to store
      login(user as UserSession, accessToken);

      // Redirect to profile
      navigate('/profile');
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        // Collect model validation error messages
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2>Welcome Back</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Enter your credentials to access your real estate portal.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <Link to="/reset-password" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="divider">or</div>

      <div className="form-group">
        <label className="form-label">Sign in with Google as:</label>
        <div className="role-selector">
          {['Buyer', 'Seller', 'Agent', 'Admin'].map((opt) => (
            <div
              key={opt}
              className={`role-option ${role === opt ? 'selected' : ''}`}
              onClick={() => setRole(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
        <GoogleLoginButton
          role={role}
          onSuccess={() => navigate('/profile')}
          onError={(msg) => setError(msg)}
        />
      </div>

      <div className="footer-link">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
};

export default LoginPage;
