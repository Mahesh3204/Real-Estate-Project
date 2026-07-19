import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import apiClient from '../../services/apiClient';
import { MESSAGES } from '../../constants/messages';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFields = z.infer<typeof forgotSchema>;

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: MESSAGES.PASSWORDS_DONT_MATCH,
  path: ['confirmPassword'],
});

type ResetFields = z.infer<typeof resetSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // If token is in URL, it acts as a direct link to reset. Otherwise we ask for email first.
  const hasToken = !!tokenFromUrl && !!emailFromUrl;

  // Form hooks for Forgot Password (request link)
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgot,
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
  });

  // Form hooks for Reset Password (confirm reset)
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
  });

  const handleRequestReset = async (data: ForgotFields) => {
    setError('');

    try {
      await apiClient.post('/api/auth/forgot-password', { email: data.email });
      dispatch(showToast({ message: MESSAGES.RESET_LINK_SENT, type: 'success' }));
      resetForgot();
    } catch (err: any) {
      setError(err.response?.data?.detail || MESSAGES.GENERIC_ERROR);
    }
  };

  const handleConfirmReset = async (data: ResetFields) => {
    setError('');

    try {
      await apiClient.post('/api/auth/reset-password', {
        email: emailFromUrl,
        token: tokenFromUrl,
        newPassword: data.newPassword,
      });

      dispatch(showToast({ message: MESSAGES.RESET_SUCCESS, type: 'success' }));
      navigate('/login');
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || MESSAGES.GENERIC_ERROR);
      }
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="glass-card animate-fade-in">
        <h2>{hasToken ? "Reset Password" : "Forgot Password"}</h2>
      
      {error && <div className="alert-error">{error}</div>}

      {!hasToken ? (
        <form onSubmit={handleSubmitForgot(handleRequestReset)}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
            Enter your email address and we'll send you a password reset link.
          </p>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="john.doe@example.com"
              {...registerForgot('email')}
            />
            {errorsForgot.email && <span className="input-error-msg">{errorsForgot.email.message}</span>}
          </div>

          <button type="submit" className="btn-primary">
            Send Reset Link
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Know your password? </span>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitReset(handleConfirmReset)}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
            Please enter your new password to complete the reset.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="form-input"
                placeholder="••••••••"
                {...registerReset('newPassword')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errorsReset.newPassword && <span className="input-error-msg">{errorsReset.newPassword.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                {...registerReset('confirmPassword')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errorsReset.confirmPassword && <span className="input-error-msg">{errorsReset.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn-primary">
            Update Password
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Need to request a new link? </span>
            <Link to="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
              Request reset
            </Link>
          </div>
        </form>
      )}
    </div>
  </div>
);
};

export default ResetPasswordPage;
