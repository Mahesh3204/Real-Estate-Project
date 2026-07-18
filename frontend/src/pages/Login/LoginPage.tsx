import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import apiClient from '../../services/apiClient';
import { MESSAGES } from '../../constants/messages';
import { useAppDispatch } from '../../store/hooks';
import { login, type UserSession } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFields) => {
    setError('');

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, user } = response.data;

      // Save to store
      dispatch(login({ user: user as UserSession, accessToken }));

      // Show success toast
      dispatch(showToast({ message: MESSAGES.LOGIN_SUCCESS, type: 'success' }));

      // Redirect to profile
      navigate('/profile');
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        // Collect model validation error messages
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || MESSAGES.LOGIN_FAILED);
      }
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2>Welcome Back</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Enter your credentials to access your real estate portal.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="name@example.com"
            {...register('email')}
          />
          {errors.email && <span className="input-error-msg">{errors.email.message}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
              Forgot password?
            </Link>
          </div>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-input"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && <span className="input-error-msg">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn-primary">
          Sign In
        </button>
      </form>

      <div className="footer-link">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
};

export default LoginPage;
