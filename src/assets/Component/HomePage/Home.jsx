import React, { useState, useMemo, useCallback } from "react";
import Logo from '../Image/Logo/Logo.png';
import New from '../Image/HomePage/Clients/New.jpeg';
import avenue from '../Image/HomePage/Clients/avenue.jpeg';
import client from '../Image/HomePage/Clients/client.jpg';
import Beverely from '../Image/HomePage/Gallery/Beverely.webp';
import resorts from '../Image/HomePage/Gallery/resorts.webp';
import Most from '../Image/HomePage/Gallery/Most.jpg';
import decor from '../Image/HomePage/Gallery/decor.jpg';
import vector from '../Image/HomePage/Gallery/vector.jpg';
import stock from '../Image/HomePage/Gallery/stock.jpg';
import diseney from '../Image/HomePage/Gallery/diseney.jpg';
import bedroom from '../Image/HomePage/Gallery/bedroom.jpg';
import Jw from '../Image/HomePage/Popular Hotel/Jw.webp';
import Sgg from '../Image/HomePage/Popular Hotel/Sgg.jpg';
import Saharas from '../Image/HomePage/Popular Hotel/Saharas.jpg';
import westin from '../Image/HomePage/Popular Hotel/westin.jpg';
import marriott from '../Image/HomePage/Popular Hotel/marriott.jpg';
import hyatt from '../Image/HomePage/Popular Hotel/hyatt.jpg';
import banner from '../Image/HomePage/banner/banner.jpg';
import star from '../Image/HomePage/banner/star.jpg';
import Novotel from '../Image/HomePage/BookingC/Novotel.jpg';
import apexx from '../Image/HomePage/BookingC/apexx.jpg';
import phoneix from '../Image/HomePage/BookingC/phoneix.jpeg';
import stLaurn from '../Image/HomePage/BookingC/stLaurn.avif';
import anjanta from '../Image/HomePage/BookingC/anjanta.jpeg';
import anjani from '../Image/HomePage/BookingC/anjani.jpg';
import tajpalace from '../Image/HomePage/BookingC/tajpalace.jpg';
import ranjeet from '../Image/HomePage/BookingC/ranjeet.avif';
import hotelG from '../Image/HomePage/BookingC/hotelG.avif';
import hotelyashoda from '../Image/HomePage/BookingC/hotelyashoda.avif';
import sai from '../Image/HomePage/BookingC/sai.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookSquare, faInstagram, faYoutube, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faStar, faMapMarkerAlt, faWifi, faSwimmingPool, faCar, faUtensils, faSpa, faConciergeBell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Home = React.memo(() => {
  const [isCheckOutVisible, setIsCheckOutVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Helper function for consistent date formatting
  const getTodayDateString = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone_number: '',
    hotelName: '',
    location: '',
    checkIn: getTodayDateString(),
    checkOut: '',
    guests: 1,
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    price: 0
  });

  // Luxury hotel data
  const luxuryHotels = useMemo(() => [
    {
      id: 1,
      name: "The Royal Palace Mumbai",
      location: "Mumbai, Maharashtra",
      image: Jw,
      rating: 5,
      price: 15000,
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Valet Parking"],
      description: "Experience unparalleled luxury in the heart of Mumbai"
    },
    {
      id: 2,
      name: "Grand Heritage Delhi",
      location: "New Delhi, Delhi",
      image: Sgg,
      rating: 5,
      price: 12000,
      amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "Business Center"],
      description: "Where tradition meets modern elegance"
    },
    {
      id: 3,
      name: "Sahara Star Premium",
      location: "Bangalore, Karnataka",
      image: Saharas,
      rating: 4,
      price: 8000,
      amenities: ["Free WiFi", "Pool", "Restaurant", "Room Service"],
      description: "Contemporary comfort in India's Silicon Valley"
    },
    {
      id: 4,
      name: "Westin Luxury Suites",
      location: "Goa, Goa",
      image: westin,
      rating: 5,
      price: 18000,
      amenities: ["Beach Access", "Pool", "Spa", "Multiple Restaurants", "Water Sports"],
      description: "Beachfront paradise with world-class amenities"
    },
    {
      id: 5,
      name: "Marriott Executive",
      location: "Chennai, Tamil Nadu",
      image: marriott,
      rating: 4,
      price: 10000,
      amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "Conference Rooms"],
      description: "Perfect blend of business and leisure"
    },
    {
      id: 6,
      name: "Hyatt Regency Elite",
      location: "Hyderabad, Telangana",
      image: hyatt,
      rating: 5,
      price: 14000,
      amenities: ["Free WiFi", "Pool", "Spa", "Multiple Restaurants", "Concierge"],
      description: "Sophisticated luxury in the City of Pearls"
    }
  ], []);

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      image: New,
      rating: 5,
      comment: "Absolutely stunning experience! The Royal Palace exceeded all expectations. The service was impeccable and the amenities were world-class."
    },
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      image: avenue,
      rating: 5,
      comment: "Best hotel stay ever! From the moment we arrived, we were treated like royalty. The staff went above and beyond to make our stay memorable."
    },
    {
      name: "Anita Patel",
      location: "Bangalore",
      image: client,
      rating: 5,
      comment: "Perfect for business trips! The facilities are top-notch and the location is ideal. Will definitely book again for my next visit."
    }
  ];

  const galleryImages = [
    { image: Beverely, title: "Luxury Suites", description: "Spacious and elegantly designed" },
    { image: resorts, title: "Resort Views", description: "Breathtaking landscapes" },
    { image: Most, title: "Fine Dining", description: "Culinary excellence" },
    { image: decor, title: "Interior Design", description: "Sophisticated aesthetics" },
    { image: vector, title: "Modern Amenities", description: "State-of-the-art facilities" },
    { image: stock, title: "Relaxation Areas", description: "Peaceful retreats" },
    { image: diseney, title: "Entertainment", description: "Family-friendly activities" },
    { image: bedroom, title: "Premium Rooms", description: "Comfort redefined" }
  ];

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      phone_number: value
    }));
  }, []);

  const searchHotels = useCallback(async () => {
    if (!formData.location || !formData.checkIn || !formData.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSearching(true);
    try {
      // Filter hotels based on location
      const filtered = luxuryHotels.filter(hotel =>
        hotel.location.toLowerCase().includes(formData.location.toLowerCase())
      );

      setSearchResults(filtered);
      setShowResults(true);

      if (filtered.length === 0) {
        toast.info('No hotels found for your search criteria. Showing all available hotels.');
        setSearchResults(luxuryHotels);
      } else {
        toast.success(`Found ${filtered.length} hotels for your dates!`);
      }
    } catch (error) {
      toast.error('Error searching hotels. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [formData, luxuryHotels]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < rating ? "text-warning" : "text-muted"}
      />
    ));
  };

  // Navigate to AI recommendations with current search criteria
  const handleAIRecommendations = useCallback(() => {
    const searchCriteria = {
      destination: formData.location || 'Mumbai',
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: {
        adults: parseInt(formData.guests) || 2,
        children: parseInt(formData.children) || 0
      },
      rooms: parseInt(formData.rooms) || 1
    };

    // Save to localStorage for persistence
    localStorage.setItem('lastSearchCriteria', JSON.stringify(searchCriteria));

    // Navigate to recommendations page with search criteria
    window.location.href = '/recommendations';
  }, [formData]);

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={Logo} alt="Hotel Royal Palace" />
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Aboutus">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Service">Services</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Blog">Blog</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Contactus">Contact</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-luxury ms-2" to="#booking">Book Now</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="luxury-badge">★ 5-Star Luxury Experience</div>
          <h1 className="hero-title">Welcome to Royal Palace</h1>
          <p className="hero-subtitle">
            Experience unparalleled luxury and hospitality across India's finest destinations
          </p>
          <div className="hero-cta">
            <a href="#booking" className="btn btn-luxury">
              <FontAwesomeIcon icon={faConciergeBell} className="me-2" />
              Book Your Stay
            </a>
            <a href="#gallery" className="btn btn-luxury" style={{ background: 'transparent', border: '2px solid white' }}>
              Explore Hotels
            </a>
            <button
              className="btn btn-luxury"
              style={{ background: 'transparent', border: '2px solid white' }}
              onClick={handleAIRecommendations}
            >
              <i className="fas fa-robot me-1"></i>Get AI Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="container">
        <div className="booking-form">
          <div className="text-center mb-4">
            <h2 className="luxury-heading">Find Your Perfect Stay</h2>
            <p className="luxury-subheading">Discover luxury accommodations tailored to your preferences</p>
            <div className="section-divider"></div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); searchHotels(); }}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Destination
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where would you like to stay?"
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Check-in Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    min={getTodayDateString()}
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Check-out Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    min={formData.checkIn}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <PhoneInput
                    country={'in'}
                    value={formData.phone_number}
                    onChange={handlePhoneChange}
                    inputClass="form-control"
                    containerClass="phone-input-container"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Guests</label>
                  <select
                    className="form-control"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-12 text-center">
                <button
                  type="submit"
                  className="btn btn-luxury btn-lg"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faConciergeBell} className="me-2" />
                      Search Luxury Hotels
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-luxury btn-lg"
                  style={{ background: 'transparent', border: '2px solid white' }}
                  onClick={handleAIRecommendations}
                >
                  <i className="fas fa-robot me-1"></i>Get AI Recommendations
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="luxury-heading">Our Signature Properties</h2>
            <p className="luxury-subheading">Handpicked luxury hotels across India's most prestigious destinations</p>
            <div className="section-divider"></div>
          </div>

          <div className="row g-4">
            {luxuryHotels.slice(0, 6).map((hotel) => (
              <div key={hotel.id} className="col-lg-4 col-md-6">
                <div className="hotel-card">
                  <img src={hotel.image} alt={hotel.name} />
                  <div className="hotel-card-body">
                    <div className="hotel-rating mb-2">
                      <div className="stars me-2">
                        {renderStars(hotel.rating)}
                      </div>
                      <span className="text-muted">({hotel.rating}.0)</span>
                    </div>
                    <h5 className="luxury-heading mb-2">{hotel.name}</h5>
                    <p className="text-muted mb-3">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                      {hotel.location}
                    </p>
                    <p className="luxury-subheading mb-3">{hotel.description}</p>
                    <div className="hotel-amenities mb-3">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="badge bg-light text-dark me-1 mb-1">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="hotel-price">
                        ₹{hotel.price.toLocaleString()}
                        <small className="text-muted d-block">per night</small>
                      </div>
                      <button className="btn btn-luxury">Book Now</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="luxury-heading">Experience Luxury</h2>
            <p className="luxury-subheading">Immerse yourself in our world of elegance and comfort</p>
            <div className="section-divider"></div>
          </div>

          <div className="gallery-grid">
            {galleryImages.map((item, index) => (
              <div key={index} className="gallery-item">
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay">
                  <div>
                    <h5 className="mb-2">{item.title}</h5>
                    <p className="mb-0">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="luxury-heading">What Our Guests Say</h2>
            <p className="luxury-subheading">Discover why travelers choose Royal Palace for unforgettable experiences</p>
            <div className="section-divider"></div>
          </div>

          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-lg-4">
                <div className="testimonial-card">
                  <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
                  <div className="stars mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="mb-3">"{testimonial.comment}"</p>
                  <h6 className="mb-1">{testimonial.name}</h6>
                  <small className="text-muted">{testimonial.location}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <img src={Logo} alt="Royal Palace" className="mb-3" style={{ height: '60px' }} />
              <p className="luxury-subheading text-light">
                Experience unparalleled luxury and hospitality across India's finest destinations.
              </p>
              <div className="d-flex gap-3">
                <FontAwesomeIcon icon={faFacebookSquare} size="2x" className="text-primary" />
                <FontAwesomeIcon icon={faInstagram} size="2x" className="text-danger" />
                <FontAwesomeIcon icon={faTwitter} size="2x" className="text-info" />
                <FontAwesomeIcon icon={faYoutube} size="2x" className="text-danger" />
              </div>
            </div>

            <div className="col-lg-2">
              <h5 className="mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                <li><Link to="/Aboutus" className="text-light text-decoration-none">About</Link></li>
                <li><Link to="/Service" className="text-light text-decoration-none">Services</Link></li>
                <li><Link to="/Blog" className="text-light text-decoration-none">Blog</Link></li>
                <li><Link to="/Contactus" className="text-light text-decoration-none">Contact</Link></li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h5 className="mb-3">Services</h5>
              <ul className="list-unstyled">
                <li>Luxury Accommodations</li>
                <li>Fine Dining</li>
                <li>Spa & Wellness</li>
                <li>Business Centers</li>
                <li>Event Planning</li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h5 className="mb-3">Contact Info</h5>
              <p>📧 info@royalpalace.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Multiple Locations Across India</p>
            </div>
          </div>

          <hr className="my-4" />
          <div className="text-center">
            <p className="mb-0">&copy; 2024 Royal Palace Hotels. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
});

export default Home;