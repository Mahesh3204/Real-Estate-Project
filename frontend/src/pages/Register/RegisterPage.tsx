import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import apiClient from '../../services/apiClient';
import { MESSAGES } from '../../constants/messages';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: MESSAGES.PASSWORDS_DONT_MATCH,
  path: ['confirmPassword'],
});

type RegisterFields = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'Buyer',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFields) => {
    setError('');

    try {
      const response = await apiClient.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: data.role,
      });

      const { userId } = response.data;

      // Navigate to OTP verification page and pass the registered user ID
      navigate('/verify', { state: { userId, email: data.email } });
    } catch (err: any) {
      const errorResponse = err.response?.data;
      if (errorResponse?.errors) {
        // FluentValidation formatted errors
        const messages = Object.values(errorResponse.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errorResponse?.detail || MESSAGES.REGISTRATION_FAILED);
      }
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h2>Create Account</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
        Join our Real Estate Platform and explore listings.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              placeholder="John"
              {...register('firstName')}
            />
            {errors.firstName && <span className="input-error-msg">{errors.firstName.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && <span className="input-error-msg">{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="john.doe@example.com"
            {...register('email')}
          />
          {errors.email && <span className="input-error-msg">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phoneNumber">Phone Number (Optional)</label>
          <input
            type="tel"
            id="phoneNumber"
            className="form-input"
            placeholder="1234567890"
            {...register('phoneNumber')}
          />
          {errors.phoneNumber && <span className="input-error-msg">{errors.phoneNumber.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
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

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="input-error-msg">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">I want to register as a:</label>
          <div className="role-selector">
            {['Buyer', 'Seller', 'Agent', 'Admin'].map((opt) => (
              <div
                key={opt}
                className={`role-option ${selectedRole === opt ? 'selected' : ''}`}
                onClick={() => setValue('role', opt, { shouldValidate: true })}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Sign Up
        </button>
      </form>

      <div className="footer-link">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
