import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookSquare, faInstagram, faYoutube, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import Logo from '../Image/Logo/Logo.png';
import about from '../Image/AboutPage/FirstBanner/about.png';
import porch from '../Image/AboutPage/SecondBanner/porch.jpg';
import banner from '../Image/AboutPage/MainBanner/banner.jpg';
import star from '../Image/AboutPage/MainBanner/star.jpg';
import './Aboutus.css';

function Aboutus() {
  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="co mt-4">
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="2000">
              <img src={banner} className="d-block w-100 h-100 object-fit-cover" alt="Slide 1" />
            </div>
            <div className="carousel-item" data-bs-interval="2000">
              <img src={star} className="d-block w-100 h-100 object-fit-cover" alt="Slide 2" />
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

      <div className="Headline mt-5">
        <h2 className="text-white">ABOUT US</h2>
      </div>

      <div className="First-section mt-5 ms-5">
        <div className="Con">
          <div className="about text-center">
            <div className="row">
              <div className="col text-left">
                <p className="text-justify">
                  The Royal Hotel is a luxurious retreat that combines timeless elegance with modern comforts...
                </p>
                <button className="rounded rs">Read More</button>
              </div>
              <div className="col">
                <img src={about} className="as" alt="about" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="Second-Section">
        <div className="Part">
          <div className="cols text-center mt-5">
            <div className="row">
              <div className="col ms-5">
                <img src={porch} className="as" alt="porch" />
              </div>
              <div className="col mt-5 text-left">
                <p>
                  Hotel Royal Palace is a great choice for travellers looking for a star hotel in Pune...
                </p>
                <div className="text-center px-4">
                  <button className="rounded rs">Read More</button>
                </div>
              </div>
            </div>
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
                    Royal Hotel offers a luxurious and <br /> unforgettable experience. <br />
                    From elegant rooms and state-of-the-art facilities to exceptional service.
                  </p>
                </div>
              </div>

              <div className="col py-4">
                <h5 className="text-white">QUICK LINKS</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  <li><Link className="quick-link text-decoration-none" to="/">Home</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Aboutus">About</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Blog">Blog</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Contactus">Contact</Link></li>
                  <li><Link className="quick-link text-decoration-none" to="/Service">Service</Link></li>
                </ul>
              </div>

              <div className="col py-4">
                <h5 className="text-white">OUR SERVICES</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  <li className="quick-link py-1 cursor-pointer">Concierge Assistance</li>
                  <li className="quick-link py-1 cursor-pointer">Wellness Recreation</li>
                  <li className="quick-link py-1 cursor-pointer">Flexible Booking</li>
                  <li className="quick-link py-1 cursor-pointer">Airport Transfers</li>
                </ul>
              </div>

              <div className="col py-4">
                <h5 className="text-white">CONTACT US</h5>
                <ul className="list-unstyled mt-3" style={{ lineHeight: '1.8' }}>
                  <li className="quick-link fw-bold cursor-pointer">RoyalHotel@info.com</li>
                </ul>
                <div className="d-flex ms-5 mx-5 px-3">
                  <a href="#" className="fs-3 me-3 text-primary" aria-label="Facebook">
                    <FontAwesomeIcon icon={faFacebookSquare} />
                  </a>
                  <a href="#" className="fs-3 me-3 text-danger" aria-label="Instagram">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="#" className="fs-3 me-3 text-white" aria-label="YouTube">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                  <a href="#" className="fs-3 text-info" aria-label="Twitter">
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
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

export default Aboutus;
