import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Lazy load all components for better performance
const Home = React.lazy(() => import('./assets/Component/HomePage/Home'));
const Aboutus = React.lazy(() => import('./assets/Component/AboutPage/Aboutus'));
const Blog = React.lazy(() => import('./assets/Component/BlogPage/Blog'));
const Contactus = React.lazy(() => import('./assets/Component/ContactPage/Contactus'));
const Service = React.lazy(() => import('./assets/Component/ServicePage/Service'));
const AdminDashboard = React.lazy(() => import('./assets/Component/AdminDashboard/AdminDashboard'));
const StaffLogin = React.lazy(() => import('./assets/Component/StaffLogin/StaffLogin'));
const HotelManagement = React.lazy(() => import('./assets/Component/HotelManagement/HotelManagement'));
const StaffManagement = React.lazy(() => import('./assets/Component/StaffManagement/StaffManagement'));
const AIAssistant = React.lazy(() => import('./assets/Component/AIAssistant/AIAssistant'));
const InventoryManagement = React.lazy(() => import('./assets/Component/InventoryManagement/InventoryManagement'));
const Analytics = React.lazy(() => import('./assets/Component/Analytics/Analytics'));
const ChainManagement = React.lazy(() => import('./assets/Component/ChainManagement/ChainManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/Aboutus" element={<Aboutus />} />
            <Route path="/Blog" element={<Blog />} />
            <Route path="/Contactus" element={<Contactus />} />
            <Route path="/Service" element={<Service />} />

            {/* Staff/Admin Routes */}
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/hotel-management" element={<HotelManagement />} />
            <Route path="/staff-management" element={<StaffManagement />} />
            <Route path="/inventory-management" element={<InventoryManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/chain-management" element={<ChainManagement />} />

            {/* AI Assistant Route */}
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
