import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SmartRecommendations from './SmartRecommendations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import './SmartRecommendations.css';

const SmartRecommendationsWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId] = useState(() =>
    localStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [sessionId] = useState(() =>
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Get search criteria from navigation state or localStorage
  const [searchCriteria, setSearchCriteria] = useState(() => {
    const stateData = location.state?.searchCriteria;
    const storedData = localStorage.getItem('lastSearchCriteria');

    return stateData || (storedData ? JSON.parse(storedData) : {
      destination: 'Mumbai',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: { adults: 2, children: 0 },
      rooms: 1
    });
  });

  // Save userId to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('lastSearchCriteria', JSON.stringify(searchCriteria));
  }, [userId, searchCriteria]);

  const handleHotelSelect = (hotel) => {
    // Navigate to hotel details or booking page
    navigate(`/hotel-details/${hotel.hotelId}`, {
      state: { hotel, searchCriteria }
    });
  };

  const handleBookingClick = (hotel) => {
    // Navigate to booking page with pre-filled data
    navigate('/booking', {
      state: {
        hotel,
        searchCriteria,
        source: 'ai_recommendations'
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSearchUpdate = (newCriteria) => {
    setSearchCriteria(newCriteria);
    localStorage.setItem('lastSearchCriteria', JSON.stringify(newCriteria));
  };

  return (
    <div className="smart-recommendations-wrapper">
      {/* Navigation Header */}
      <div className="recommendations-nav">
        <div className="nav-content">
          <button
            className="back-btn"
            onClick={handleBackToHome}
            title="Back to Home"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Home</span>
          </button>

          <div className="nav-title">
            <FontAwesomeIcon icon={faHome} />
            <h1>AI-Powered Hotel Recommendations</h1>
          </div>

          <div className="search-summary">
            <span className="destination">{searchCriteria.destination}</span>
            <span className="dates">
              {new Date(searchCriteria.checkIn).toLocaleDateString()} - {new Date(searchCriteria.checkOut).toLocaleDateString()}
            </span>
            <span className="guests">
              {searchCriteria.guests.adults} Adults
              {searchCriteria.guests.children > 0 && `, ${searchCriteria.guests.children} Children`}
            </span>
          </div>
        </div>
      </div>

      {/* Search Criteria Update Panel */}
      <div className="search-update-panel">
        <div className="search-form">
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              value={searchCriteria.destination}
              onChange={(e) => handleSearchUpdate({
                ...searchCriteria,
                destination: e.target.value
              })}
              placeholder="Enter destination"
            />
          </div>

          <div className="form-group">
            <label>Check-in</label>
            <input
              type="date"
              value={searchCriteria.checkIn}
              onChange={(e) => handleSearchUpdate({
                ...searchCriteria,
                checkIn: e.target.value
              })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Check-out</label>
            <input
              type="date"
              value={searchCriteria.checkOut}
              onChange={(e) => handleSearchUpdate({
                ...searchCriteria,
                checkOut: e.target.value
              })}
              min={searchCriteria.checkIn}
            />
          </div>

          <div className="form-group">
            <label>Adults</label>
            <select
              value={searchCriteria.guests.adults}
              onChange={(e) => handleSearchUpdate({
                ...searchCriteria,
                guests: {
                  ...searchCriteria.guests,
                  adults: parseInt(e.target.value)
                }
              })}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Children</label>
            <select
              value={searchCriteria.guests.children}
              onChange={(e) => handleSearchUpdate({
                ...searchCriteria,
                guests: {
                  ...searchCriteria.guests,
                  children: parseInt(e.target.value)
                }
              })}
            >
              {[0, 1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Recommendations Component */}
      <SmartRecommendations
        userId={userId}
        sessionId={sessionId}
        searchCriteria={searchCriteria}
        onHotelSelect={handleHotelSelect}
        onBookingClick={handleBookingClick}
      />
    </div>
  );
};

export default SmartRecommendationsWrapper;
