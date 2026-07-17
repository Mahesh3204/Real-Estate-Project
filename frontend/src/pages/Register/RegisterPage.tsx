import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Buyer'); // Admin, Agent, Buyer, Seller
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
      });

      const { userId } = response.data;

      // Navigate to OTP verification page and pass the registered user ID
      navigate('/verify', { state: { userId, email } });
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        // FluentValidation formatted errors
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || "Registration failed. Please check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2>Create Account</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
        Join our Real Estate Platform and explore listings.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              placeholder="John"
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
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <label className="form-label" htmlFor="phoneNumber">Phone Number (Optional)</label>
          <input
            type="tel"
            id="phoneNumber"
            className="form-input"
            placeholder="1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Min 8 chars, 1 uppercase, 1 number, 1 special char.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">I want to register as a:</label>
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
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="footer-link">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
