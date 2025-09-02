import React from 'react';
import banner from '../Image/Servicepage/MainBanner/banner.jpg';
import Logo from '../Image/Logo/Logo.png';
import swimming from '../Image/Servicepage/Services/swimming.jpg';
import parking from '../Image/Servicepage/Services/parking.png';
import lifts from '../Image/Servicepage/Services/lifts.jpg';
import star from '../Image/Servicepage/MainBanner/star.jpg';
import Wifi from '../Image/Servicepage/Services/Wifi.webp';
import Security from '../Image/Servicepage/Services/Security.webp';
import Hall from '../Image/Servicepage/Services/Hall.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookSquare, faInstagram, faYoutube, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import './Service.css';

function Service() {
  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="co mt-4">
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="2000">
              <img src={banner} className="d-block w-100" alt="Slide 1" />
            </div>
            <div className="carousel-item" data-bs-interval="2000">
              <img src={star} className="d-block w-100" alt="Slide 2" />
            </div>
          </div>
        </div>

        <div className="header d-flex justify-content-between align-items-center px-4">
          <img src={Logo} className="logo" alt="Logo" />
          <nav className="navbar d-flex gap-4">
            <Link className="text-decoration-none text-white nav" to="/" onClick={handleScrollToBottom}>Home</Link>
            <Link className="text-decoration-none text-white nav" to="/Aboutus" onClick={handleScrollToBottom}>About</Link>
            <Link className="text-decoration-none text-white nav" to="/Blog" onClick={handleScrollToBottom}>Blog</Link>
            <Link className="text-decoration-none text-white nav" to="/Service" onClick={handleScrollToBottom}>Service</Link>
            <Link className="text-decoration-none text-white nav" to="/Contactus" onClick={handleScrollToBottom}>Contact</Link>
          </nav>
          <button className="book-now text-white mx-4 bg-danger">Book Now</button>
        </div>
      </div>

      <div className='Servic'>
        <h2 className='text-white'>SERVICES</h2>
      </div>

      <div className="Service-Section my-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {[{ img: swimming, title: "Swimming Pool", desc: "Dive into serenity and luxury at our exquisite swimming pool. Designed with elegance and surrounded lush greenery." },
          { img: parking, title: "Paid Parking", desc: "Experience hassle-free parking with our secure and well-maintained paid parking facility Strategically located." },
          { img: lifts, title: "Lift", desc: "Effortlessly navigate every floor of our property with our state-of-the-art lift service. Designed for comfort reliability." }].map((item, index) => (
            <div className="col" key={index}>
              <div className="card" style={{ width: "80%" }}>
                <img src={item.img} className="card-img-top" alt={item.title} />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text text-start">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='Second-columns mt-5'>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {[{ img: Wifi, title: "WiFi Connection", desc: "Knowing your Wi-Fi details helps you troubleshoot connectivity issues ensures." },
            { img: Security, title: "Professional Security", desc: "Measures, protocols, and systems designed to protect individuals, businesses, assets." },
            { img: Hall, title: "Reception Hall", desc: "Designed to accommodate a specific number of guests comfortably, for private events." }].map((item, index) => (
              <div className="col" key={index}>
                <div className="card" style={{ width: "80%" }}>
                  <img src={item.img} className="card-img-top" alt={item.title} />
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text text-start">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer mt-5" id="contact" style={{ minHeight: '300px' }}>
        <div className="bg-black text-light">
          <div className="container-fluid">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 gy-4 py-4 px-5">
              <div className="col">
                <div className="d-flex flex-column" style={{ lineHeight: '1.8' }}>
                  <img src={Logo} className="lk mx-5" alt="Logo" />
                  <p className="text-secondary">
                    Royal Hotel offers a luxurious and unforgettable experience. From elegant rooms and state-of-the-art facilities to exceptional service.
                  </p>
                </div>
              </div>

              <div className="col py-4">
                <h5 className="text-white">QUICK LINKS</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  <li><Link className="quick-link text-decoration-none" to="/" onClick={handleScrollToBottom}>Home</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Aboutus" onClick={handleScrollToBottom}>About</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Blog" onClick={handleScrollToBottom}>Blog</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Contactus" onClick={handleScrollToBottom}>Contact</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Service" onClick={handleScrollToBottom}>Service</Link></li>
                </ul>
              </div>

              <div className="col py-4">
                <h5 className="text-white">OUR SERVICES</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  {['Concierge Assistance', 'Wellness Recreation', 'Flexible Booking', 'Airport Transfers'].map((item, i) => (
                    <li className="quick-link py-1 cursor-pointer" key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="col py-4">
                <h5 className="text-white">CONTACT US</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  <li className="quick-link fw-bold cursor-pointer">RoyalHotel@info.com</li>
                </ul>
                <div className="d-flex ms-5 mx-5 px-3">
                  <a href="#" className="fs-3 me-3 text-primary" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookSquare} /></a>
                  <a href="#" className="fs-3 me-3 text-danger" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
                  <a href="#" className="fs-3 me-3 text-white" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a>
                  <a href="#" className="fs-3 text-info" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-2 bg-dark text-light">
          Copyright 2024 Hotel Royal Palace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Service;
