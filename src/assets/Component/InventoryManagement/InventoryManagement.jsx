import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // Placeholder for inventory API
      setInventory([]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inventory-management">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      <div className="management-header">
        <div className="container">
          <h1 className="header-title">
            <i className="fas fa-boxes me-3"></i>
            Inventory Management
          </h1>
          <p className="header-subtitle">
            Track supplies and equipment across all hotels
          </p>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>Inventory Management System</h5>
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

export default InventoryManagement;
