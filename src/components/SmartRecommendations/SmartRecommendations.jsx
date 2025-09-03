import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faStar,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faBolt,
  faHeart,
  faEye,
  faChartLine,
  faFilter,
  faMagic,
  faThumbsUp,
  faThumbsDown,
  faShare,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SmartRecommendations.css';

const SmartRecommendations = ({
  userId,
  sessionId,
  searchCriteria,
  onHotelSelect,
  onBookingClick
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    budget: { min: 0, max: 50000, preferred: 15000 },
    amenities: [],
    travelPurpose: 'leisure',
    groupSize: { adults: 2, children: 0 }
  });
  const [filters, setFilters] = useState({
    category: 'all', // all, perfect_match, budget_friendly, luxury_upgrade, trending
    priceRange: 'all',
    rating: 0,
    sortBy: 'relevance' // relevance, price_low, price_high, rating, popularity
  });
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [interactionHistory, setInteractionHistory] = useState([]);

  // Fetch AI recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/recommendations/generate', {
        userId,
        sessionId,
        searchCriteria,
        preferences: userPreferences,
        filters
      });

      setRecommendations(response.data.recommendations);
      setAiInsights(response.data.insights);

      // Track recommendation view
      trackInteraction('recommendations_viewed', {
        count: response.data.recommendations.length,
        filters: filters
      });

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId, searchCriteria, userPreferences, filters]);

  // Track user interactions for ML learning
  const trackInteraction = useCallback(async (action, data) => {
    try {
      await axios.post('/api/recommendations/track', {
        userId,
        sessionId,
        action,
        data,
        timestamp: new Date()
      });

      setInteractionHistory(prev => [...prev, { action, data, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [userId, sessionId]);

  // Handle hotel interaction
  const handleHotelInteraction = useCallback((hotel, action) => {
    const startTime = Date.now();

    switch (action) {
      case 'view':
        setSelectedHotel(hotel);
        trackInteraction('hotel_viewed', {
          hotelId: hotel.hotelId,
          score: hotel.score,
          category: hotel.category
        });
        if (onHotelSelect) onHotelSelect(hotel);
        break;

      case 'like':
        trackInteraction('hotel_liked', {
          hotelId: hotel.hotelId,
          reasons: hotel.reasons
        });
        toast.success('Preference saved! We\'ll show you similar hotels.');
        break;

      case 'dislike':
        trackInteraction('hotel_disliked', {
          hotelId: hotel.hotelId,
          reasons: hotel.reasons
        });
        // Remove from current recommendations
        setRecommendations(prev => prev.filter(h => h.hotelId !== hotel.hotelId));
        toast.info('We\'ll avoid similar recommendations.');
        break;

      case 'book':
        trackInteraction('booking_initiated', {
          hotelId: hotel.hotelId,
          price: hotel.dynamicPricing?.finalPrice,
          originalPrice: hotel.dynamicPricing?.originalPrice
        });
        if (onBookingClick) onBookingClick(hotel);
        break;

      case 'share':
        trackInteraction('hotel_shared', {
          hotelId: hotel.hotelId,
          platform: 'native'
        });
        navigator.share({
          title: hotel.name,
          text: `Check out this amazing hotel: ${hotel.name}`,
          url: window.location.href
        });
        break;

      case 'save':
        trackInteraction('hotel_saved', {
          hotelId: hotel.hotelId
        });
        toast.success('Hotel saved to your wishlist!');
        break;
    }
  }, [onHotelSelect, onBookingClick, trackInteraction]);

  // Update preferences
  const updatePreferences = useCallback((newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
    trackInteraction('preferences_updated', newPreferences);
  }, [trackInteraction]);

  // Render recommendation card
  const renderRecommendationCard = useCallback((hotel, index) => {
    const {
      hotelId,
      name,
      location,
      rating,
      image,
      amenities,
      score,
      reasons,
      category,
      confidence,
      dynamicPricing,
      virtualTour,
      availability
    } = hotel;

    const categoryColors = {
      perfect_match: 'var(--success-color)',
      budget_friendly: 'var(--info-color)',
      luxury_upgrade: 'var(--warning-color)',
      similar_taste: 'var(--primary-color)',
      trending: 'var(--danger-color)'
    };

    const categoryIcons = {
      perfect_match: faMagic,
      budget_friendly: faChartLine,
      luxury_upgrade: faStar,
      similar_taste: faHeart,
      trending: faBolt
    };

    return (
      <div
        key={hotelId}
        className={`recommendation-card ${category}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Category Badge */}
        <div
          className="category-badge"
          style={{ backgroundColor: categoryColors[category] }}
        >
          <FontAwesomeIcon icon={categoryIcons[category]} />
          <span>{category.replace('_', ' ')}</span>
        </div>

        {/* AI Score */}
        <div className="ai-score">
          <FontAwesomeIcon icon={faRobot} />
          <span>{Math.round(score * 100)}% Match</span>
        </div>

        {/* Hotel Image */}
        <div className="hotel-image-container">
          <img src={image} alt={name} className="hotel-image" />

          {/* Virtual Tour Button */}
          {virtualTour && (
            <button
              className="virtual-tour-btn"
              onClick={() => handleHotelInteraction(hotel, 'virtual_tour')}
            >
              <FontAwesomeIcon icon={faEye} />
              360° Tour
            </button>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="action-btn like"
              onClick={() => handleHotelInteraction(hotel, 'like')}
              title="Like this recommendation"
            >
              <FontAwesomeIcon icon={faThumbsUp} />
            </button>
            <button
              className="action-btn dislike"
              onClick={() => handleHotelInteraction(hotel, 'dislike')}
              title="Not interested"
            >
              <FontAwesomeIcon icon={faThumbsDown} />
            </button>
            <button
              className="action-btn save"
              onClick={() => handleHotelInteraction(hotel, 'save')}
              title="Save to wishlist"
            >
              <FontAwesomeIcon icon={faBookmark} />
            </button>
            <button
              className="action-btn share"
              onClick={() => handleHotelInteraction(hotel, 'share')}
              title="Share hotel"
            >
              <FontAwesomeIcon icon={faShare} />
            </button>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="hotel-info">
          <h3 className="hotel-name">{name}</h3>

          <div className="hotel-meta">
            <div className="location">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{location}</span>
            </div>

            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                  key={i}
                  icon={faStar}
                  className={i < Math.floor(rating) ? 'filled' : 'empty'}
                />
              ))}
              <span>({rating})</span>
            </div>
          </div>

          {/* AI Reasons */}
          <div className="ai-reasons">
            <h4>Why we recommend this:</h4>
            <ul>
              {reasons.slice(0, 3).map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Amenities */}
          <div className="amenities">
            {amenities.slice(0, 4).map((amenity, i) => (
              <span key={i} className="amenity-tag">{amenity}</span>
            ))}
            {amenities.length > 4 && (
              <span className="amenity-more">+{amenities.length - 4} more</span>
            )}
          </div>

          {/* Dynamic Pricing */}
          {dynamicPricing && (
            <div className="pricing-section">
              <div className="price-display">
                <span className="current-price">₹{dynamicPricing.finalPrice.toLocaleString()}</span>
                {dynamicPricing.originalPrice !== dynamicPricing.finalPrice && (
                  <span className="original-price">₹{dynamicPricing.originalPrice.toLocaleString()}</span>
                )}
                <span className="per-night">per night</span>
              </div>

              {dynamicPricing.discount > 0 && (
                <div className="discount-info">
                  <span className="discount-badge">
                    Save ₹{dynamicPricing.discount.toLocaleString()}
                  </span>
                </div>
              )}

              {dynamicPricing.priceChangeReason.length > 0 && (
                <div className="price-reasons">
                  <small>{dynamicPricing.priceChangeReason.join(', ')}</small>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          {availability && (
            <div className="availability-info">
              <span className={`availability-status ${availability.status}`}>
                {availability.roomsLeft} rooms left
              </span>
              {availability.urgency && (
                <span className="urgency-indicator">
                  <FontAwesomeIcon icon={faBolt} />
                  High demand!
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-secondary"
              onClick={() => handleHotelInteraction(hotel, 'view')}
            >
              View Details
            </button>
            <button
              className="btn-primary"
              onClick={() => handleHotelInteraction(hotel, 'book')}
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${confidence * 100}%` }}
          ></div>
          <span className="confidence-text">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
      </div>
    );
  }, [handleHotelInteraction]);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(hotel => hotel.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        budget: [0, 5000],
        mid: [5000, 15000],
        luxury: [15000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange] || [0, Infinity];
      filtered = filtered.filter(hotel => {
        const price = hotel.dynamicPricing?.finalPrice || 0;
        return price >= min && price <= max;
      });
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) =>
          (a.dynamicPricing?.finalPrice || 0) - (b.dynamicPricing?.finalPrice || 0)
        );
        break;
      case 'price_high':
        filtered.sort((a, b) =>
          (b.dynamicPricing?.finalPrice || 0) - (a.dynamicPricing?.finalPrice || 0)
        );
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      default: // relevance
        filtered.sort((a, b) => b.score - a.score);
    }

    return filtered;
  }, [recommendations, filters]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="smart-recommendations loading">
        <div className="loading-animation">
          <FontAwesomeIcon icon={faRobot} className="spinning" />
          <h3>AI is analyzing your preferences...</h3>
          <p>Finding the perfect hotels just for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      {/* Header */}
      <div className="recommendations-header">
        <div className="header-content">
          <h2>
            <FontAwesomeIcon icon={faRobot} />
            AI-Powered Recommendations
          </h2>
          <p>Personalized hotel suggestions based on your preferences and behavior</p>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="ai-insights">
            <h4>AI Insights</h4>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-label">Your Style:</span>
                <span className="insight-value">{aiInsights.userStyle}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Best Time to Book:</span>
                <span className="insight-value">{aiInsights.bestBookingTime}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Trending in Your Area:</span>
                <span className="insight-value">{aiInsights.trendingCategory}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="recommendations-controls">
        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Categories</option>
            <option value="perfect_match">Perfect Match</option>
            <option value="budget_friendly">Budget Friendly</option>
            <option value="luxury_upgrade">Luxury Upgrade</option>
            <option value="similar_taste">Similar Taste</option>
            <option value="trending">Trending</option>
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
          >
            <option value="all">All Prices</option>
            <option value="budget">Budget (₹0-5K)</option>
            <option value="mid">Mid-range (₹5K-15K)</option>
            <option value="luxury">Luxury (₹15K+)</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="relevance">Most Relevant</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>

        <button
          className="preferences-btn"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <FontAwesomeIcon icon={faFilter} />
          Preferences
        </button>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="preferences-panel">
          <h4>Customize Your Preferences</h4>
          {/* Preference controls would go here */}
        </div>
      )}

      {/* Recommendations Grid */}
      <div className={`recommendations-grid ${viewMode}`}>
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((hotel, index) =>
            renderRecommendationCard(hotel, index)
          )
        ) : (
          <div className="no-recommendations">
            <FontAwesomeIcon icon={faRobot} />
            <h3>No recommendations found</h3>
            <p>Try adjusting your filters or preferences</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredRecommendations.length > 0 && (
        <div className="load-more">
          <button
            className="btn-secondary"
            onClick={() => fetchRecommendations()}
          >
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
