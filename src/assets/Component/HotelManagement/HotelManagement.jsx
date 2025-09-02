import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HotelManagement.css';

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // view, edit, add
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChain, setFilterChain] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelsPerPage] = useState(6);

  const [hotelForm, setHotelForm] = useState({
    name: '',
    chainId: '',
    hotelCode: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: '',
      coordinates: { lat: 0, lng: 0 }
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    description: '',
    amenities: [],
    images: [],
    rating: 0,
    totalRooms: 0,
    roomTypes: [],
    priceRange: { min: 0, max: 0 },
    operationalInfo: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      isActive: true,
      maintenanceMode: false
    }
  });

  useEffect(() => {
    fetchHotels();
    fetchChains();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/hotels');
      setHotels(response.data.hotels || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/hotel-chain');
      setChains(response.data.chains || []);
    } catch (error) {
      console.error('Error fetching chains:', error);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    if (section) {
      setHotelForm(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: inputValue
        }
      }));
    } else {
      setHotelForm(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  const handleArrayInputChange = (field, index, value) => {
    setHotelForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setHotelForm(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setHotelForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const openModal = (type, hotel = null) => {
    setModalType(type);
    if (hotel) {
      setSelectedHotel(hotel);
      setHotelForm(hotel);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
    resetForm();
  };

  const resetForm = () => {
    setHotelForm({
      name: '',
      chainId: '',
      hotelCode: '',
      location: {
        address: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        coordinates: { lat: 0, lng: 0 }
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      description: '',
      amenities: [],
      images: [],
      rating: 0,
      totalRooms: 0,
      roomTypes: [],
      priceRange: { min: 0, max: 0 },
      operationalInfo: {
        checkInTime: '14:00',
        checkOutTime: '11:00',
        isActive: true,
        maintenanceMode: false
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post('http://localhost:5001/api/hotels', hotelForm);
        toast.success('Hotel added successfully');
      } else if (modalType === 'edit') {
        response = await axios.put(`http://localhost:5001/api/hotels/${selectedHotel._id}`, hotelForm);
        toast.success('Hotel updated successfully');
      }

      fetchHotels();
      closeModal();
    } catch (error) {
      console.error('Error saving hotel:', error);
      toast.error('Failed to save hotel');
    }
  };

  const handleDelete = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await axios.delete(`http://localhost:5001/api/hotels/${hotelId}`);
        toast.success('Hotel deleted successfully');
        fetchHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
        toast.error('Failed to delete hotel');
      }
    }
  };

  const toggleHotelStatus = async (hotelId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/hotels/${hotelId}/status`, {
        isActive: !currentStatus
      });
      toast.success('Hotel status updated');
      fetchHotels();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter and search logic
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChain = !filterChain || hotel.chainId === filterChain;
    const matchesStatus = !filterStatus ||
      (filterStatus === 'active' && hotel.operationalInfo?.isActive) ||
      (filterStatus === 'inactive' && !hotel.operationalInfo?.isActive);

    return matchesSearch && matchesChain && matchesStatus;
  });

  // Pagination
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  if (loading) {
    return (
      <div className="hotel-management">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-management">
      {/* Header */}
      <div className="management-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="header-title">
                <i className="fas fa-hotel me-3"></i>
                Hotel Management
              </h1>
              <p className="header-subtitle">
                Manage all hotels in your chain from one place
              </p>
            </div>
            <div className="col-md-6 text-end">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => openModal('add')}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Hotel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Filters */}
        <div className="filters-section">
          <div className="row">
            <div className="col-md-4">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value)}
              >
                <option value="">All Chains</option>
                {chains.map(chain => (
                  <option key={chain._id} value={chain._id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <div className="results-count">
                {filteredHotels.length} hotels found
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="hotels-grid">
          {currentHotels.length > 0 ? (
            currentHotels.map(hotel => (
              <div key={hotel._id} className="hotel-card">
                <div className="hotel-image">
                  <img
                    src={hotel.images?.[0] || '/src/assets/Component/Image/Hotel/hotel1.jpg'}
                    alt={hotel.name}
                    onError={(e) => {
                      e.target.src = '/src/assets/Component/Image/Hotel/hotel1.jpg';
                    }}
                  />
                  <div className="hotel-status">
                    <span className={`status-badge ${hotel.operationalInfo?.isActive ? 'active' : 'inactive'}`}>
                      {hotel.operationalInfo?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="hotel-content">
                  <div className="hotel-header">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < hotel.rating ? 'filled' : ''}`}
                        ></i>
                      ))}
                      <span className="rating-text">({hotel.rating})</span>
                    </div>
                  </div>

                  <div className="hotel-info">
                    <div className="info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{hotel.location?.city}, {hotel.location?.state}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-bed"></i>
                      <span>{hotel.totalRooms} rooms</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-rupee-sign"></i>
                      <span>₹{hotel.priceRange?.min} - ₹{hotel.priceRange?.max}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-code"></i>
                      <span>{hotel.hotelCode}</span>
                    </div>
                  </div>

                  <div className="hotel-actions">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openModal('view', hotel)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      View
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => openModal('edit', hotel)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </button>
                    <button
                      className={`btn btn-outline-${hotel.operationalInfo?.isActive ? 'warning' : 'info'} btn-sm`}
                      onClick={() => toggleHotelStatus(hotel._id, hotel.operationalInfo?.isActive)}
                    >
                      <i className={`fas fa-${hotel.operationalInfo?.isActive ? 'pause' : 'play'} me-1`}></i>
                      {hotel.operationalInfo?.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(hotel._id)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-hotels">
              <i className="fas fa-hotel"></i>
              <h3>No hotels found</h3>
              <p>Try adjusting your search criteria or add a new hotel</p>
              <button
                className="btn btn-primary"
                onClick={() => openModal('add')}
              >
                <i className="fas fa-plus me-2"></i>
                Add First Hotel
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'add' && 'Add New Hotel'}
                  {modalType === 'edit' && 'Edit Hotel'}
                  {modalType === 'view' && 'Hotel Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Basic Information */}
                    <div className="col-md-6">
                      <h6 className="section-title">Basic Information</h6>

                      <div className="mb-3">
                        <label className="form-label">Hotel Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={hotelForm.name}
                          onChange={handleInputChange}
                          required
                          disabled={modalType === 'view'}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Hotel Chain *</label>
                        <select
                          className="form-select"
                          name="chainId"
                          value={hotelForm.chainId}
                          onChange={handleInputChange}
                          required
                          disabled={modalType === 'view'}
                        >
                          <option value="">Select Chain</option>
                          {chains.map(chain => (
                            <option key={chain._id} value={chain._id}>
                              {chain.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Hotel Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="hotelCode"
                          value={hotelForm.hotelCode}
                          onChange={handleInputChange}
                          required
                          disabled={modalType === 'view'}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          rows="3"
                          value={hotelForm.description}
                          onChange={handleInputChange}
                          disabled={modalType === 'view'}
                        />
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="col-md-6">
                      <h6 className="section-title">Location Information</h6>

                      <div className="mb-3">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={hotelForm.location.address}
                          onChange={(e) => handleInputChange(e, 'location')}
                          required
                          disabled={modalType === 'view'}
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="city"
                            value={hotelForm.location.city}
                            onChange={(e) => handleInputChange(e, 'location')}
                            required
                            disabled={modalType === 'view'}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">State *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="state"
                            value={hotelForm.location.state}
                            onChange={(e) => handleInputChange(e, 'location')}
                            required
                            disabled={modalType === 'view'}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            name="country"
                            value={hotelForm.location.country}
                            onChange={(e) => handleInputChange(e, 'location')}
                            disabled={modalType === 'view'}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Zip Code</label>
                          <input
                            type="text"
                            className="form-control"
                            name="zipCode"
                            value={hotelForm.location.zipCode}
                            onChange={(e) => handleInputChange(e, 'location')}
                            disabled={modalType === 'view'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    {/* Contact Information */}
                    <div className="col-md-6">
                      <h6 className="section-title">Contact Information</h6>

                      <div className="mb-3">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={hotelForm.contact.phone}
                          onChange={(e) => handleInputChange(e, 'contact')}
                          required
                          disabled={modalType === 'view'}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={hotelForm.contact.email}
                          onChange={(e) => handleInputChange(e, 'contact')}
                          required
                          disabled={modalType === 'view'}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Website</label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          value={hotelForm.contact.website}
                          onChange={(e) => handleInputChange(e, 'contact')}
                          disabled={modalType === 'view'}
                        />
                      </div>
                    </div>

                    {/* Operational Information */}
                    <div className="col-md-6">
                      <h6 className="section-title">Operational Information</h6>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Rating</label>
                          <input
                            type="number"
                            className="form-control"
                            name="rating"
                            min="0"
                            max="5"
                            step="0.1"
                            value={hotelForm.rating}
                            onChange={handleInputChange}
                            disabled={modalType === 'view'}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Total Rooms</label>
                          <input
                            type="number"
                            className="form-control"
                            name="totalRooms"
                            min="0"
                            value={hotelForm.totalRooms}
                            onChange={handleInputChange}
                            disabled={modalType === 'view'}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Status</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isActive"
                              checked={hotelForm.operationalInfo?.isActive || false}
                              onChange={(e) => handleInputChange(e, 'operationalInfo')}
                              disabled={modalType === 'view'}
                            />
                            <label className="form-check-label">
                              Active
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Check-in Time</label>
                          <input
                            type="time"
                            className="form-control"
                            name="checkInTime"
                            value={hotelForm.operationalInfo?.checkInTime || '14:00'}
                            onChange={(e) => handleInputChange(e, 'operationalInfo')}
                            disabled={modalType === 'view'}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Check-out Time</label>
                          <input
                            type="time"
                            className="form-control"
                            name="checkOutTime"
                            value={hotelForm.operationalInfo?.checkOutTime || '11:00'}
                            onChange={(e) => handleInputChange(e, 'operationalInfo')}
                            disabled={modalType === 'view'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {modalType !== 'view' && (
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {modalType === 'add' ? 'Add Hotel' : 'Update Hotel'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default HotelManagement;
