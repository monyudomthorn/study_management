import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';

export const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Enter Code & Reset
  const [emailOrId, setEmailOrId] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Request Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      addToast('Please enter your email or Student ID.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(emailOrId.trim());
      if (res?.reset_code) {
        setGeneratedCode(res.reset_code);
        setInputCode(res.reset_code); // auto-fill for frictionless testing
      }
      addToast('Verification code generated!', 'success');
      setStep(2);
    } catch (err) {
      addToast(err.message || 'Could not find student account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!inputCode.trim() || !newPassword) {
      addToast('Please enter the verification code and new password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        email: emailOrId.trim(),
        code: inputCode.trim(),
        password: newPassword
      });
      addToast(res.message || 'Password successfully updated! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.message || 'Failed to reset password. Please check the code.', 'error');
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
        {/* Header */}
        <div className="auth-header">
          <img
            src="/setec-logo.png"
            alt="SETEC Logo"
            className="auth-logo-img"
          />
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {step === 1
              ? 'Enter your Student Email or ID to receive a verification code'
              : 'Enter verification code and choose your new password'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="auth-step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1. Request Code</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2. New Password</div>
        </div>

        {step === 1 ? (
          /* STEP 1 FORM */
          <form onSubmit={handleRequestCode} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-identifier">
                Student Email or Student ID <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-mail-send-line input-icon"></i>
                <input
                  id="reset-identifier"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. monyudom@setec.edu.kh or SET-2026-8899"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-100 auth-submit-btn"
              disabled={isSubmitting}
              icon={isSubmitting ? 'ri-loader-4-line ri-spin' : 'ri-key-2-line'}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Verification Code'}
            </Button>
          </form>
        ) : (
          /* STEP 2 FORM */
          <form onSubmit={handleResetPassword} className="auth-form">
            {/* Display Code Alert */}
            {generatedCode && (
              <div className="auth-code-alert">
                <div className="auth-code-header">
                  <i className="ri-shield-keyhole-line"></i>
                  <span>Security Verification Code:</span>
                </div>
                <div className="auth-code-digits">{generatedCode}</div>
                <small>Use this 6-digit code below to confirm your identity.</small>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-code">
                6-Digit Verification Code <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-hashtag input-icon"></i>
                <input
                  id="reset-code"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px', letterSpacing: '2px', fontWeight: 'bold' }}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-password">
                New Password <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-lock-password-line input-icon"></i>
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-shield-check-line input-icon"></i>
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <Button
                type="submit"
                variant="primary"
                style={{ flex: 2 }}
                disabled={isSubmitting}
                icon={isSubmitting ? 'ri-loader-4-line ri-spin' : 'ri-check-line'}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link-bold">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
