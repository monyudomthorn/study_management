import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';

export const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    role: 'Management Information System (MIS)',
    university: 'SETEC Institute',
    year: 'Year 2, Semester 1',
    telegram: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      addToast(t('errorRequiredFields') || 'Please fill in all required fields.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let cleanTelegram = formData.telegram.trim();
      if (cleanTelegram && !cleanTelegram.startsWith('@')) {
        cleanTelegram = `@${cleanTelegram}`;
      }

      const payload = {
        ...formData,
        studentId: formData.studentId.trim() || `SET-${Date.now().toString().slice(-4)}`,
        telegram: cleanTelegram
      };

      const res = await register(payload);
      addToast(res.message || 'Account created successfully! Welcome.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background Decorative Glows */}
      <div className="auth-glow-bg auth-glow-1"></div>
      <div className="auth-glow-bg auth-glow-2"></div>

      <div className="auth-card auth-card-lg">
        {/* Header */}
        <div className="auth-header">
          <img
            src="/setec-logo.png"
            alt="SETEC Logo"
            className="auth-logo-img"
          />
          <h1 className="auth-title">Create Student Account</h1>
          <p className="auth-subtitle">Join the SETEC Study Management & Academic Tracking System</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-user-line input-icon"></i>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Monyudom Thorn"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Student Email <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-mail-line input-icon"></i>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. monyudom@setec.edu.kh"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Student ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-studentid">
                Student ID
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-id-card-line input-icon"></i>
                <input
                  id="reg-studentid"
                  name="studentId"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. M2425-0384"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Major / Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                Major / Department
              </label>
              <select
                id="reg-role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Management Information System (MIS)">Management Information System (MIS)</option>
                <option value="Business Information Technology (BIT)">Business Information Technology (BIT)</option>
                <option value="Design (DS)">Design (DS)</option>
                <option value="Computer Science (CS)">Computer Science (CS)</option>
                <option value="Software Engineering (SE)">Software Engineering (SE)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Academic Year */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-year">
                Academic Year
              </label>
              <select
                id="reg-year"
                name="year"
                className="form-control"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="Year 1, Semester 1">Year 1, Semester 1</option>
                <option value="Year 1, Semester 2">Year 1, Semester 2</option>
                <option value="Year 2, Semester 1">Year 2, Semester 1</option>
                <option value="Year 2, Semester 2">Year 2, Semester 2</option>
                <option value="Year 3, Semester 1">Year 3, Semester 1</option>
                <option value="Year 3, Semester 2">Year 3, Semester 2</option>
                <option value="Year 4, Semester 1">Year 4, Semester 1</option>
                <option value="Year 4, Semester 2">Year 4, Semester 2</option>
              </select>
            </div>

            {/* Telegram */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-telegram">
                Telegram Handle
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-telegram-line input-icon"></i>
                <input
                  id="reg-telegram"
                  name="telegram"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="@monyudomthorn"
                  value={formData.telegram}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-lock-2-line input-icon"></i>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="input-icon-wrapper">
                <i className="ri-shield-check-line input-icon"></i>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-100 auth-submit-btn"
            disabled={isSubmitting}
            icon={isSubmitting ? 'ri-loader-4-line ri-spin' : 'ri-user-add-line'}
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        {/* Footer Link to Login */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link-bold">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
