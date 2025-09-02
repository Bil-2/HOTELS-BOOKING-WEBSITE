import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StaffLogin.css';

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/staff/login', {
        email,
        password
      });

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('staffToken', response.data.token);
        localStorage.setItem('staffUser', JSON.stringify(response.data.staff));

        toast.success('Login successful!');

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      'Chain Admin': { email: 'vikram.singh@hotelroyalpalace.com', password: 'admin123' },
      'Hotel Manager': { email: 'rajesh.kumar@hotelroyalpalace.com', password: 'manager123' },
      'Staff': { email: 'anita.patel@hotelroyalpalace.com', password: 'staff123' }
    };

    const credentials = demoCredentials[role];
    setFormData(credentials);

    // Auto-submit after setting credentials
    setTimeout(() => {
      handleSubmit({ preventDefault: () => { } });
    }, 500);
  };

  return (
    <div className="staff-login">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-section">
              <img
                src="/src/assets/Component/Image/Logo/logo.png"
                alt="Hotel Royal Palace"
                className="login-logo"
              />
              <h2 className="login-title">Staff Portal</h2>
              <p className="login-subtitle">Hotel Royal Palace Chain Management</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="login-body">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="fas fa-envelope me-2"></i>Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <i className="fas fa-lock me-2"></i>Password
                </label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Login Section */}
            <div className="demo-section">
              <div className="divider">
                <span>Demo Accounts</span>
              </div>

              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn btn-outline-primary demo-btn"
                  onClick={() => handleDemoLogin('Chain Admin')}
                  disabled={loading}
                >
                  <i className="fas fa-crown me-2"></i>
                  Chain Admin
                </button>

                <button
                  type="button"
                  className="btn btn-outline-success demo-btn"
                  onClick={() => handleDemoLogin('Hotel Manager')}
                  disabled={loading}
                >
                  <i className="fas fa-user-tie me-2"></i>
                  Hotel Manager
                </button>

                <button
                  type="button"
                  className="btn btn-outline-info demo-btn"
                  onClick={() => handleDemoLogin('Staff')}
                  disabled={loading}
                >
                  <i className="fas fa-user me-2"></i>
                  Staff Member
                </button>
              </div>

              <div className="demo-info">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Click any demo button to login with sample credentials
                </small>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <div className="footer-links">
              <Link to="/" className="footer-link">
                <i className="fas fa-home me-1"></i>
                Back to Website
              </Link>
              <a href="#" className="footer-link">
                <i className="fas fa-question-circle me-1"></i>
                Need Help?
              </a>
            </div>

            <div className="system-info">
              <small className="text-muted">
                Hotel Royal Palace Multi-Chain Management System v2.0
              </small>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h3 className="features-title">Management Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon bg-primary">
                <i className="fas fa-hotel"></i>
              </div>
              <div className="feature-content">
                <h5>Multi-Hotel Management</h5>
                <p>Manage multiple hotel locations from one centralized dashboard</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon bg-success">
                <i className="fas fa-robot"></i>
              </div>
              <div className="feature-content">
                <h5>24/7 AI Assistant</h5>
                <p>Intelligent customer support with real-time analytics</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon bg-info">
                <i className="fas fa-users"></i>
              </div>
              <div className="feature-content">
                <h5>Staff Management</h5>
                <p>Complete employee management with role-based access</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon bg-warning">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="feature-content">
                <h5>Advanced Analytics</h5>
                <p>Real-time insights and comprehensive reporting</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default StaffLogin;
