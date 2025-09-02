import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    hotels: [],
    chains: [],
    staff: [],
    bookings: [],
    analytics: {}
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    if (!token) {
      navigate('/staff-login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const config = {
        headers: { 'x-auth-token': token }
      };

      // Fetch multiple data sources
      const [statusRes, hotelsRes, chainsRes, staffRes] = await Promise.all([
        axios.get('http://localhost:5001/api/status'),
        axios.get('http://localhost:5001/api/hotels', config),
        axios.get('http://localhost:5001/api/chain', config),
        axios.get('http://localhost:5001/api/staff', config)
      ]);

      setDashboardData({
        analytics: statusRes.data.statistics,
        hotels: hotelsRes.data.data || [],
        chains: chainsRes.data.data || [],
        staff: staffRes.data.data || []
      });

      // Get user info from token
      const userInfo = JSON.parse(localStorage.getItem('staffUser'));
      setUser(userInfo);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        navigate('/staff-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="dashboard-title">
                <i className="fas fa-tachometer-alt me-2"></i>
                Hotel Royal Palace - Admin Dashboard
              </h1>
              <p className="dashboard-subtitle">Multi-Chain Management System</p>
            </div>
            <div className="col-md-6 text-end">
              <div className="user-info">
                <span className="welcome-text">Welcome, {user?.fullName}</span>
                <span className="user-role badge bg-primary ms-2">{user?.role}</span>
                <button className="btn btn-outline-light btn-sm ms-3" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid dashboard-content">
        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card bg-primary">
              <div className="stat-icon">
                <i className="fas fa-hotel"></i>
              </div>
              <div className="stat-details">
                <h3>{dashboardData.analytics.totalHotels || 0}</h3>
                <p>Total Hotels</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card bg-success">
              <div className="stat-icon">
                <i className="fas fa-link"></i>
              </div>
              <div className="stat-details">
                <h3>{dashboardData.analytics.totalChains || 0}</h3>
                <p>Hotel Chains</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card bg-info">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-details">
                <h3>{dashboardData.analytics.totalBookings || 0}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card bg-warning">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-details">
                <h3>{dashboardData.staff.length}</h3>
                <p>Staff Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-bolt me-2"></i>Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/hotel-management" className="quick-action-btn">
                      <i className="fas fa-building"></i>
                      <span>Manage Hotels</span>
                    </Link>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/staff-management" className="quick-action-btn">
                      <i className="fas fa-user-tie"></i>
                      <span>Manage Staff</span>
                    </Link>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/inventory-management" className="quick-action-btn">
                      <i className="fas fa-boxes"></i>
                      <span>Inventory</span>
                    </Link>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/analytics" className="quick-action-btn">
                      <i className="fas fa-chart-bar"></i>
                      <span>Analytics</span>
                    </Link>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/chain-management" className="quick-action-btn">
                      <i className="fas fa-sitemap"></i>
                      <span>Chain Settings</span>
                    </Link>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <Link to="/ai-assistant" className="quick-action-btn">
                      <i className="fas fa-robot"></i>
                      <span>AI Assistant</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Overview */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-hotel me-2"></i>Hotels Overview
                </h5>
                <Link to="/hotel-management" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Hotel Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Occupancy</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.hotels.slice(0, 5).map((hotel) => (
                        <tr key={hotel._id}>
                          <td>
                            <strong>{hotel.name}</strong>
                            <br />
                            <small className="text-muted">{hotel.hotelCode}</small>
                          </td>
                          <td>{hotel.location}</td>
                          <td>
                            <span className={`badge ${hotel.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                              {hotel.status}
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{ height: '20px' }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${hotel.occupancyRate || 0}%` }}
                              >
                                {hotel.occupancyRate || 0}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="rating">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star ${i < Math.floor(hotel.rating) ? 'text-warning' : 'text-muted'}`}
                                ></i>
                              ))}
                              <span className="ms-1">{hotel.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-clock me-2"></i>Recent Activity
                </h5>
              </div>
              <div className="card-body">
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-icon bg-success">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">New staff member added</p>
                      <small className="activity-time">2 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon bg-info">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">New booking received</p>
                      <small className="activity-time">4 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon bg-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">Low inventory alert</p>
                      <small className="activity-time">6 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon bg-primary">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">AI Assistant handled 25 queries</p>
                      <small className="activity-time">1 day ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-server me-2"></i>System Status
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="system-status-item">
                      <div className="status-indicator bg-success"></div>
                      <span>Database Connection</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="system-status-item">
                      <div className="status-indicator bg-success"></div>
                      <span>API Services</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="system-status-item">
                      <div className="status-indicator bg-success"></div>
                      <span>AI Assistant</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="system-status-item">
                      <div className="status-indicator bg-success"></div>
                      <span>Payment Gateway</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
