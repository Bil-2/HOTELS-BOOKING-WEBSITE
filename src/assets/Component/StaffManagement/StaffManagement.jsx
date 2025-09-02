import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/staff');
      setStaff(response.data.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-management">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management">
      <div className="management-header">
        <div className="container">
          <h1 className="header-title">
            <i className="fas fa-users me-3"></i>
            Staff Management
          </h1>
          <p className="header-subtitle">
            Manage staff members across all hotel locations
          </p>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>Staff Management System</h5>
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

export default StaffManagement;
