import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/status');
      setAnalytics(response.data.statistics || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="management-header">
        <div className="container">
          <h1 className="header-title">
            <i className="fas fa-chart-line me-3"></i>
            Analytics Dashboard
          </h1>
          <p className="header-subtitle">
            Real-time insights and comprehensive reporting
          </p>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>Analytics Dashboard</h5>
                <p>This feature is under development. Coming soon!</p>
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

export default Analytics;
