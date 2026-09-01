import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';

export const Login = () => {
  const { login, loadDemoUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !password.trim()) {
      addToast(t('errorRequiredFields') || 'Please enter your email/Student ID and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginIdentifier.trim(), password);
      addToast(res.message || 'Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoginIdentifier('monyudom@setec.edu.kh');
    setPassword('password123');
    setIsSubmitting(true);
    try {
      const res = await login('monyudom@setec.edu.kh', 'password123');
      addToast(res.message || 'Logged in with Demo Student Account!', 'success');
      navigate('/dashboard');
    } catch (err) {
      loadDemoUser();
      addToast('Logged in as Demo Student.', 'success');
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background Decorative Glows */}
      <div className="auth-glow-bg auth-glow-1"></div>
      <div className="auth-glow-bg auth-glow-2"></div>

      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <img
            src="/setec-logo.png"
            alt="SETEC Logo"
            className="auth-logo-img"
          />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">SETEC Study Management & Tracking Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">
              Email or Student ID <span className="text-danger">*</span>
            </label>
            <div className="input-icon-wrapper">
              <i className="ri-user-3-line input-icon"></i>
              <input
                id="login-identifier"
                type="text"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. monyudom@setec.edu.kh or SET-2026-8899"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                Password <span className="text-danger">*</span>
              </label>
              <Link to="/forgot-password" className="auth-link-sm">
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrapper" style={{ marginTop: '6px' }}>
              <i className="ri-lock-2-line input-icon"></i>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          <div className="auth-options-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember my session</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-100 auth-submit-btn"
            disabled={isSubmitting}
            icon={isSubmitting ? 'ri-loader-4-line ri-spin' : 'ri-login-box-line'}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Quick Demo Button */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={handleQuickDemoLogin}
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <i className="ri-flashlight-line" style={{ color: 'var(--color-primary)' }}></i>
            Quick 1-Click Demo Login
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link-bold">
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
