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
import { Link } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Home = React.memo(() => {

  const [isCheckOutVisible, setIsCheckOutVisible] = useState(false);

  const handleCheckInFocus = useCallback(() => {
    setIsCheckOutVisible(true);
  }, []);

  const testimonials = useMemo(() => [
    {
      name: "John Doe",
      image: client,
      feedback:
        "Highly professional team. They ensured everything was perfect for our travel needs.",
    },
    {
      name: "Jane Smith",
      image: New,
      feedback:
        "Excellent service and a user-friendly platform. I was able to find the best deals in minutes.",
    },
    {
      name: "Michael Avenue",
      image: avenue,
      feedback:
        "The team provided outstanding service. I highly recommend their expertise.",
    },
    {
      name: "Emily Rose",
      image: client,
      feedback: "Fantastic experience! I’ll definitely use their service again.",
    },
  ], []);

  const groupedTestimonials = useMemo(() => {
    const grouped = [];
    for (let i = 0; i < testimonials.length; i += 2) {
      grouped.push(testimonials.slice(i, i + 2));
    }
    return grouped;
  }, [testimonials]);

  const [bookingDetails, setBookingDetails] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    amount: '',
  });

  const [selectedPaymentButton, setSelectedPaymentButton] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const [paymentMethods, setPaymentMethods] = useState({
    googlePay: false,
    phonePe: false,
    paytm: false,
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
    roomType: 'standard',
    specialRequests: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePaid = useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      isPaid: true,
    }));
  }, []);

  const handleBookNow = useCallback((hotel) => {
    setSelectedHotel(hotel);
    setIsBooking(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const invalidEmails = ["123@gmail.com", "test@gmail.com"]; // Block specific emails

      if (!emailRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Please enter a valid email ",
        }));
      } else if (invalidEmails.includes(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "This email is not allowed",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "",
        }));
      }
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const foundHotels = [
      { name: "Hotel Novotel", location: "kolkata", price: "Rs.5000", img: Novotel, },
      { name: "Hotel Apex International", location: "Mumbai", price: "Rs.9000", img: apexx, },
      { name: "Hotel St Laurn", location: "Pune", price: "Rs.5000", img: stLaurn, },
      { name: "Hotel Anjata", location: "Delhi", price: "Rs.6000", img: anjanta, },
      { name: "Hotel Phoneix International", location: "Mumbai", price: "Rs.8000", img: phoneix, },
      { name: "Hotel Grand Choice", location: "Beed", price: "Rs.8000", img: hotelG, },
      { name: "Hotel Grand Yashoda", location: "Beed", price: "Rs.9000", img: hotelyashoda, },
      { name: "Hotel Sai International", location: "Latur", price: "Rs.2000", img: sai, },
      { name: "Hotel Anjani", location: "Latur", price: "Rs.9000", img: anjani, },
      { name: "Hotel Ranjeet", location: "Akola", price: "Rs.7000", img: ranjeet },
      { name: "Hotel Taj Palace", location: "New Delhi", price: "Rs.5000", img: tajpalace, },
    ];
    setHotels(foundHotels);
    setShowResults(true);
  }, []);

  const handleBookingInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    // Special handling for date inputs
    if (name === 'checkIn' || name === 'checkOut') {
      // Ensure date is complete and valid
      if (value && value.length === 10) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          toast.error('Please select a date from today onwards');
          return;
        }

        // If setting check-out date, ensure it's after check-in
        if (name === 'checkOut' && formData.checkIn) {
          const checkInDate = new Date(formData.checkIn);
          if (selectedDate <= checkInDate) {
            toast.error('Check-out date must be after check-in date');
            return;
          }
        }

        // If setting check-in date and check-out exists, validate check-out
        if (name === 'checkIn' && formData.checkOut) {
          const checkOutDate = new Date(formData.checkOut);
          if (selectedDate >= checkOutDate) {
            // Clear check-out date if it becomes invalid
            setFormData(prev => ({
              ...prev,
              [name]: value,
              checkOut: ''
            }));
            toast.info('Check-out date cleared. Please select a new check-out date.');
            return;
          }
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, [formData.checkIn, formData.checkOut]);

  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }

    if (!formData.checkIn) {
      toast.error('Please select check-in date');
      return;
    }

    if (!formData.checkOut) {
      toast.error('Please select check-out date');
      return;
    }

    // Validate date format and values
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      toast.error('Please enter valid dates');
      return;
    }

    if (checkInDate < today) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Calculate minimum stay (1 night)
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 1) {
      toast.error('Minimum stay is 1 night');
      return;
    }

    setIsSearching(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResults = [
        {
          id: 1,
          name: 'Hotel Royal Palace Mumbai',
          location: 'Mumbai, Maharashtra',
          price: 8500,
          rating: 4.8,
          image: Most,
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
          nights: daysDiff
        },
        {
          id: 2,
          name: 'Hotel Royal Palace Delhi',
          location: 'New Delhi, Delhi',
          price: 9200,
          rating: 4.9,
          image: Beverely,
          amenities: ['WiFi', 'Gym', 'Business Center', 'Airport Shuttle'],
          nights: daysDiff
        }
      ];

      setSearchResults(mockResults);
      setShowBookingModal(true);
      toast.success(`Found ${mockResults.length} hotels for ${daysDiff} night${daysDiff > 1 ? 's' : ''}!`);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const validateBooking = useCallback(() => {
    const errors = {};
    if (!bookingDetails.location) errors.location = "Location is required.";
    if (!bookingDetails.checkIn) errors.checkIn = "Check-In date is required.";
    if (!bookingDetails.checkOut) errors.checkOut = "Check-Out date is required.";
    if (!bookingDetails.guests) errors.guests = "Number of guests is required.";
    if (!bookingDetails.amount) errors.amount = "Amount is required.";
    if (parseInt(bookingDetails.guests) <= 0) errors.guests = "Guests number must be greater than 0.";
    if (parseFloat(bookingDetails.amount) <= 0) errors.amount = "Amount must be greater than 0.";
    return Object.keys(errors).length === 0 ? null : errors;
  }, [bookingDetails]);

  const openHotelModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const selectHotel = useCallback((hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(false);
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5001/api/bookings");

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Bookings fetched:", data);
      setBookings(data);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error.message);
      alert("Failed to fetch bookings. Please check the API URL.");
    }
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    let newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 10 || !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }


    if (["Google Pay", "PhonePe", "Paytm"].includes(formData.paymentMethod) && !formData.upiId) {
      toast.error("Please enter a valid UPI ID or phone number for online payment.");
      return;
    }

    if (formData.paymentMethod === "Cash" && formData.paymentStatus !== "Completed") {
      toast.error("Please click 'Paid' before confirming the booking.");
      return;
    }


    const formattedPrice = (Number(selectedHotel.price.toString().replace(/[^0-9.]/g, '')) * 10000).toFixed(0);
    const paymentStatus = formData.paymentMethod === "Cash" ? formData.paymentStatus : "Completed";

    const bookingDetails = {
      customerName: formData.customerName,
      email: formData.email,
      phone_number: formData.phone,
      hotelName: selectedHotel.name,
      location: selectedHotel.location,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: Number(formData.guests),
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      price: formattedPrice,
    };

    try {
      console.log("📤 Sending booking details:", bookingDetails);

      const response = await axios.post("http://localhost:5001/api/bookings/book-hotel", bookingDetails, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ API Response:", response.data);

      if (response.data.pdfDownloadLink) {
        window.open(response.data.pdfDownloadLink, "_blank");
        toast.success("Booking Confirmed");
      } else {
        toast.error("Booking confirmed, but receipt download failed.");
      }

      setFormData((prev) => ({ ...prev, paymentStatus }));

      setIsBooking(false);
    } catch (error) {
      console.error("❌ Error confirming booking:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }

  }, [formData, selectedHotel]);

  const handlePaymentChange = useCallback((method) => {
    setFormData((prevData) => ({
      ...prevData,
      paymentMethod: method,
      paymentStatus: method === "Cash" ? "Pending" : "Completed",
      isPaid: method !== "Cash",
    }));
  }, []);

  const checkForExistingBooking = useCallback(async (formData) => {
    try {
      const response = await axios.get('http://localhost:5001/api/bookings', {
        params: { location: formData.location, checkIn: formData.checkIn, checkOut: formData.checkOut }
      });
      return response.data.length > 0;
    } catch (err) {
      console.error('Error checking for existing booking:', err);
      return false;
    }

  }, []);

  const handleScrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  const validatePhoneNumber = useCallback((value, country) => {
    const numberWithoutCode = value.replace(/^\+\d{1,3}/, "");

    if (country?.countryCode === "in") {
      if (numberWithoutCode.length < 10) {
        setError("");
      } else if (!/^[6-9][0-9]{9}$/.test(numberWithoutCode)) {
        setError("❌ Enter a valid 10-digit Indian number.");
      } else {
        setError("");
      }
    } else {
      if (numberWithoutCode.length < 6) {
        setError("");
      } else if (numberWithoutCode.length > 14) {
        setError("❌ Too many digits. Enter a valid number.");
      } else {
        setError("");
      }
    }
  }, []);

  const handlePhoneChange = useCallback((value, country) => {
    setFormData((prevData) => ({
      ...prevData,
      phone: value,
    }));

    setPhone(value);
    validatePhoneNumber(value, country);

    handleChange({ target: { name: "phone", value } }); // Pass value to parent

    setErrors((prevErrors) => ({
      ...prevErrors,
      phone: "",
    }));
  }, [handleChange]);

  const handleBookNowFromModal = (hotel) => {
    toast.success(`Booking initiated for ${hotel.name}`);
    setShowBookingModal(false);
    // Navigate to booking page or show booking form
  };

  return (
    <div className="co">
      {/* Mobile-Optimized Carousel */}
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          />
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          />
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          />
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="3"
            aria-label="Slide 4"
          />
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="4"
            aria-label="Slide 5"
          />
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src={banner}
              className="d-block w-100"
              alt="Hotel Royal Palace"
              loading="lazy"
            />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="display-4 fw-bold text-white">Welcome to Hotel Royal Palace</h1>
              <p className="lead text-white">Luxury Redefined</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src={Most}
              className="d-block w-100"
              alt="Premium Hotel Rooms"
              loading="lazy"
            />
            <div className="carousel-caption d-none d-md-block">
              <h2 className="fw-bold text-white">Premium Rooms & Suites</h2>
              <p className="text-white">Experience luxury and comfort</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src={bedroom}
              className="d-block w-100"
              alt="Elegant Bedrooms"
              loading="lazy"
            />
            <div className="carousel-caption d-none d-md-block">
              <h2 className="fw-bold text-white">Elegant Bedrooms</h2>
              <p className="text-white">Rest in style and comfort</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src={decor}
              className="d-block w-100"
              alt="Beautiful Interiors"
              loading="lazy"
            />
            <div className="carousel-caption d-none d-md-block">
              <h2 className="fw-bold text-white">Beautiful Interiors</h2>
              <p className="text-white">Stunning design and architecture</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src={vector}
              className="d-block w-100"
              alt="Luxury Amenities"
              loading="lazy"
            />
            <div className="carousel-caption d-none d-md-block">
              <h2 className="fw-bold text-white">Luxury Amenities</h2>
              <p className="text-white">World-class facilities and services</p>
            </div>
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Mobile-First Header */}
      <div className="header">
        <img
          src={Logo}
          alt="Hotel Royal Palace Logo"
          className="logo"
          loading="eager"
        />
        <nav className="navbar">
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/about">About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/blog">Blog</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/service">Service</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/contact">Contact</Link>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-booking ms-2"
                  onClick={() => document.querySelector('.booking__container').scrollIntoView({ behavior: 'smooth' })}
                >
                  Book Now
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile-Optimized Booking Form */}
      <div className="booking__container animate__animated animate__fadeInUp">
        <form onSubmit={handleSearch} className="booking-form animate__animated animate__fadeInUp">
          <div className="row g-3">
            <div className="col-md-2">
              <div className="form-group animate__animated animate__fadeInLeft animate__delay-1s">
                <label htmlFor="location" className="form-label">Location</label>
                <select
                  id="location"
                  name="location"
                  className="form-select"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Location</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">New Delhi</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                  <option value="kolkata">Kolkata</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                  <option value="jaipur">Jaipur</option>
                  <option value="goa">Goa</option>
                  <option value="kerala">Kerala</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group animate__animated animate__fadeInLeft animate__delay-2s">
                <label htmlFor="checkIn" className="form-label">Check-in</label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  className="form-control"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group animate__animated animate__fadeInLeft animate__delay-3s">
                <label htmlFor="checkOut" className="form-label">Check-out</label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  className="form-control"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group animate__animated animate__fadeInLeft animate__delay-4s">
                <label htmlFor="guests" className="form-label">Guests</label>
                <select
                  id="guests"
                  name="guests"
                  className="form-select"
                  value={formData.guests}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group animate__animated animate__fadeInLeft animate__delay-5s">
                <label htmlFor="roomType" className="form-label">Room Type</label>
                <select
                  id="roomType"
                  name="roomType"
                  className="form-select"
                  value={formData.roomType}
                  onChange={handleInputChange}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="presidential">Presidential</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group animate__animated animate__scaleIn animate__delay-5s">
                <label className="form-label d-none d-md-block">&nbsp;</label>
                <button
                  type="submit"
                  className="btn btn-search w-100 h-100 d-flex align-items-center justify-content-center"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search me-2"></i>
                      Search Hotels
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Popular Hotels Section */}
      <div className="Popular-Hotel animate__animated animate__fadeInUp">
        <h3>Popular Hotels</h3>
        <div className="d-flex">
          <div className="card">
            <img
              src={Jw}
              className="card-img-top"
              alt="Hotel JW Marriott Mumbai"
              loading="lazy"
            />
            <div className="card-body">
              <h5 className="card-title">Hotel JW Marriott Mumbai</h5>
              <p className="card-text">Experience luxury in the heart of Mumbai with world-class amenities.</p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rating">
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star" style={{ color: '#ffc107' }}></i>
                  <span className="ms-2 text-muted">4.5</span>
                </div>
              </div>
              <button className="bttn">
                View Details
              </button>
            </div>
          </div>
          <div className="card">
            <img
              src={Sgg}
              className="card-img-top"
              alt="Hotel Sahara Star"
              loading="lazy"
            />
            <div className="card-body">
              <h5 className="card-title">Hotel Sahara Star</h5>
              <p className="card-text">Premium accommodation in the capital city with exceptional service.</p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rating">
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star" style={{ color: '#ffc107' }}></i>
                  <span className="ms-2 text-muted">4.5</span>
                </div>
              </div>
              <button className="bttn">
                View Details
              </button>
            </div>
          </div>
          <div className="card">
            <img
              src={Saharas}
              className="card-img-top"
              alt="Hotel Sahara Star"
              loading="lazy"
            />
            <div className="card-body">
              <h5 className="card-title">Hotel Sahara Star</h5>
              <p className="card-text">Experience luxury in the heart of Mumbai with world-class amenities.</p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rating">
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>
                  <i className="bi bi-star" style={{ color: '#ffc107' }}></i>
                  <span className="ms-2 text-muted">4.5</span>
                </div>
              </div>
              <button className="bttn">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Sections */}
      <div className="cont animate__animated animate__fadeInUp">
        <h4>Our Rooms & Suites</h4>
        <div className="row">
          <div className="col">
            <img
              src={Beverely}
              alt="Deluxe Room"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={resorts}
              alt="Suite Room"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={Most}
              alt="Presidential Suite"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={decor}
              alt="Family Room"
              className="ig"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="conts animate__animated animate__fadeInUp">
        <h4>Dining & Restaurants</h4>
        <div className="row">
          <div className="col">
            <img
              src={vector}
              alt="Fine Dining Restaurant"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={stock}
              alt="Rooftop Bar"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={diseney}
              alt="Coffee Lounge"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={bedroom}
              alt="Buffet Restaurant"
              className="ig"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="containe animate__animated animate__fadeInUp">
        <h4>Amenities & Facilities</h4>
        <div className="row">
          <div className="col">
            <img
              src={Jw}
              alt="Luxury Spa"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={Sgg}
              alt="Swimming Pool"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={Saharas}
              alt="Fitness Center"
              className="ig"
              loading="lazy"
            />
          </div>
          <div className="col">
            <img
              src={westin}
              alt="Conference Hall"
              className="ig"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="contars animate__animated animate__fadeInUp">
        <h2>What Our Guests Say</h2>
        <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="d-flex">
                <div className="card">
                  <div className="card-body text-center">
                    <p className="card-text">"Exceptional service and luxurious amenities. The staff went above and beyond to make our stay memorable."</p>
                    <h6 className="card-title">- Sarah Johnson</h6>
                    <small className="text-muted">Business Traveler</small>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <p className="card-text">"Perfect location, beautiful rooms, and outstanding hospitality. Will definitely return for our next vacation."</p>
                    <h6 className="card-title">- Michael Chen</h6>
                    <small className="text-muted">Family Guest</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer animate__animated animate__fadeInUp">
        <div className="row">
          <div className="col">
            <img
              src={Logo}
              alt="Hotel Royal Palace"
              className="lk"
              loading="lazy"
            />
            <p>Experience luxury and comfort at Hotel Royal Palace. Your perfect stay awaits.</p>
          </div>
          <div className="col">
            <h5>Quick Links</h5>
            <Link to="/" className="quick-link" onClick={handleScrollToBottom}>
              Home
            </Link><br />
            <Link to="/about" className="quick-link" onClick={handleScrollToBottom}>
              About Us
            </Link><br />
            <Link to="/service" className="quick-link" onClick={handleScrollToBottom}>
              Services
            </Link><br />
            <Link to="/contact" className="quick-link" onClick={handleScrollToBottom}>
              Contact
            </Link>
          </div>
          <div className="col">
            <h5>Services</h5>
            <a href="#" className="quick-link">Room Service</a><br />
            <a href="#" className="quick-link">Spa & Wellness</a><br />
            <a href="#" className="quick-link">Conference Halls</a><br />
            <a href="#" className="quick-link">Airport Transfer</a>
          </div>
          <div className="col">
            <h5>Contact Info</h5>
            <p><i className="bi bi-geo-alt-fill me-2"></i>123 Royal Street, Mumbai</p>
            <p><i className="bi bi-telephone-fill me-2"></i>+91 98765 43210</p>
            <p><i className="bi bi-envelope-fill me-2"></i>info@hotelroyalpalace.com</p>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p>&copy; 2024 Hotel Royal Palace. All rights reserved.</p>
        </div>
      </div>

      {/* Search Results Modal */}
      {showBookingModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>
                  Available Hotels
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBookingModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="search-summary mb-4">
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Location:</strong> {formData.location}
                    </div>
                    <div className="col-md-3">
                      <strong>Check-in:</strong> {formData.checkIn}
                    </div>
                    <div className="col-md-3">
                      <strong>Check-out:</strong> {formData.checkOut}
                    </div>
                    <div className="col-md-3">
                      <strong>Guests:</strong> {formData.guests}
                    </div>
                  </div>
                </div>

                <div className="search-results">
                  {searchResults.map(hotel => (
                    <div key={hotel.id} className="hotel-result-card mb-3">
                      <div className="row g-0">
                        <div className="col-md-4">
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="hotel-result-image"
                          />
                        </div>
                        <div className="col-md-8">
                          <div className="hotel-result-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h5 className="hotel-result-title">{hotel.name}</h5>
                                <p className="hotel-result-location">
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {hotel.location}
                                </p>
                                <div className="hotel-rating mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <i
                                      key={i}
                                      className={`fas fa-star ${i < Math.floor(hotel.rating) ? 'text-warning' : 'text-muted'}`}
                                    ></i>
                                  ))}
                                  <span className="ms-2">{hotel.rating}/5</span>
                                </div>
                                <div className="hotel-amenities">
                                  {hotel.amenities.map((amenity, index) => (
                                    <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="hotel-price">
                                  <span className="price-amount">₹{hotel.price.toLocaleString()}</span>
                                  <small className="price-period">/night</small>
                                </div>
                                <button
                                  className="btn btn-primary btn-sm mt-2"
                                  onClick={() => handleBookNowFromModal(hotel)}
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBookingModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setFormData({
                      location: '',
                      checkIn: '',
                      checkOut: '',
                      guests: '1',
                      roomType: 'standard',
                      specialRequests: ''
                    });
                    setShowBookingModal(false);
                  }}
                >
                  New Search
                </button>
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
});

export default Home;