import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './NewLanding.css';

import Slider from 'react-slick';

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillTwitterCircle,
} from 'react-icons/ai';
import { FiCheckCircle } from 'react-icons/fi';

import heroImage from '../assets/Hero.png';
import approachImage from '../assets/edu1 (12).jpg';
import learningImage from '../assets/edu1 (7).jpg';
import graduationImage from '../assets/edu1 (10).jpg';
import studentsImage from '../assets/edu1 (15).jpg';
import careerImage from '../assets/edu1 (6).jpg';

import logo from '../assets/BADMAN.jpg';
import home1 from '../assets/edu1 (2).jpg';
import home9 from '../assets/edu1 (3).jpg';
import home10 from '../assets/edu1 (4).jpg';

function NewLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000 });
    AOS.refresh();
  }, []);

  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus(data.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error sending message.');
    }
  };

  return (
    <div className="elc-wrapper">
      {/* HEADER */}
      <header className="elc-header" data-aos="fade-down">
        <div className="elc-logo">
          <img src={logo} alt="Engineering College Logo" className="elc-logo-img" />
        </div>
        <div
          className="elc-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <nav className={`elc-nav-wrapper ${menuOpen ? 'open' : ''}`}>
          <ul className="elc-nav">
            <li><a href="#home">Home</a></li>
            <li><a href="#programmes">Programmes</a></li>
            <li><a href="#faculty">Faculty</a></li>
            <li><a href="#infrastructure">Infrastructure</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#career">Career</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact-form">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* HERO */}
      <section
        className="elc-hero"
        id="home"
        style={{ backgroundImage: `url(${heroImage})` }}
        data-aos="zoom-in"
      >
        <div className="elc-overlay" />
        <div className="elc-hero-text animate-slide-up">
          <h1>SOF College of Engineering</h1>
          <h2>Empowering the Next Generation of Engineers</h2>
          <p>Approved by NUC | Accredited by COREN</p>

          <div className="elc-button-group">
            <div
              className="elc-dropdown"
              onMouseEnter={() => setShowStudentDropdown(true)}
              onMouseLeave={() => setShowStudentDropdown(false)}
            >
              <button className="elc-button hover-glow">Student</button>
              {showStudentDropdown && (
                <div className="elc-dropdown-menu animate-fade-in">
                  <a href="/login-student">Login</a>
                  <a href="/signup-student">Signup</a>
                </div>
              )}
            </div>

            <div
              className="elc-dropdown"
              onMouseEnter={() => setShowStaffDropdown(true)}
              onMouseLeave={() => setShowStaffDropdown(false)}
            >
              <button className="elc-button hover-glow">Staff</button>
              {showStaffDropdown && (
                <div className="elc-dropdown-menu animate-fade-in">
                  <a href="/login-teacher">Login</a>
                  <a href="/signup-teacher">Signup</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="elc-main-wrapper">
        {/* GRID SECTION */}
        <div className="elc-grid-section">
          {/* Boxes */}
          <div className="elc-box elc-box--image-text" data-aos="fade-up">
            <img src={approachImage} alt="Our Approach" />
            <div className="elc-overlay">
              <h2>Our Approach</h2>
              <p>
                At SOF College of Engineering, learning goes beyond the classroom.
                We combine theory with hands-on labs, real-world projects, and industry exposure
                to ensure our students graduate as innovators, builders, and problem-solvers.
              </p>
              <a href="#">Read More</a>
            </div>
          </div>

          <div className="elc-box elc-box--blue" data-aos="fade-up">
            <h2>Announcements</h2>
            <p>
              Stay updated with the latest news, admission updates, academic calendars,
              and student opportunities at SOF College of Engineering.
            </p>
            <a href="#">Read More</a>
          </div>

          <div className="elc-box elc-box--image-text" data-aos="fade-up">
            <img src={learningImage} alt="Learning" />
            <div className="elc-overlay">
              <h2>Innovative Learning</h2>
              <p>
                Our programmes encourage creativity, collaboration, and critical thinking.
                Students work on engineering challenges that prepare them to excel globally.
              </p>
              <a href="#">Read More</a>
            </div>
          </div>

          <div className="elc-box elc-box--blue" data-aos="fade-up">
            <h2>Events</h2>
            <p>
              From hackathons and research fairs to public lectures and exhibitions,
              our vibrant campus events bring ideas to life and connect students with industry leaders.
            </p>
            <a href="#">Read More</a>
          </div>

          <div className="elc-box elc-box--image-only" data-aos="zoom-in">
            <img src={graduationImage} alt="Graduation" />
          </div>

          <div className="elc-box elc-box--blue" data-aos="fade-up">
            <h2>About SOF Engineering</h2>
            <p>
              Proudly approved by the National Universities Commission (NUC)
              and accredited by COREN, we are committed to training the next generation
              of world-class engineers in Nigeria and beyond.
            </p>
          </div>

          <div className="elc-box elc-box--image-only" data-aos="zoom-in">
            <img src={studentsImage} alt="Students" />
          </div>
        </div>

        {/* FEATURES */}
<section className="elc-features" id="features" data-aos="fade-up">
  <h2>Why Choose Us</h2>
  <ul className="elc-features-list">
    <li><FiCheckCircle className="feature-icon" /> Curriculum designed with input from leading Nigerian engineers and industry experts</li>
    <li><FiCheckCircle className="feature-icon" /> Highly qualified lecturers and professors – including COREN-registered engineers</li>
    <li><FiCheckCircle className="feature-icon" /> Hands-on workshops and laboratory training</li>
    <li><FiCheckCircle className="feature-icon" /> Industrial training (SIWES) every session</li>
    <li><FiCheckCircle className="feature-icon" /> Entrepreneurship and innovation-focused courses</li>
    <li><FiCheckCircle className="feature-icon" /> Accredited programmes aligned with NUC and COREN standards</li>
    <li><FiCheckCircle className="feature-icon" /> Research and development opportunities in renewable energy, ICT, and civil works</li>
    <li><FiCheckCircle className="feature-icon" /> Partnerships with Nigerian and international industries for internships</li>
    <li><FiCheckCircle className="feature-icon" /> Modern engineering facilities and digital learning tools</li>
    <li><FiCheckCircle className="feature-icon" /> Dedicated career and employability support</li>
  </ul>
</section>
        {/* PROGRAMMES */}
        <section className="elc-programmes" id="programmes" data-aos="fade-up">
          <h2>Our Engineering Programmes</h2>
          <div className="elc-programme"><span>&#9658; B.Eng. Civil Engineering</span><button>Curriculum & Syllabus</button></div>
          <div className="elc-programme"><span>&#9658; B.Eng. Electrical & Electronics Engineering</span><button>Curriculum & Syllabus</button></div>
          <div className="elc-programme"><span>&#9658; B.Eng. Mechanical Engineering</span><button>Curriculum & Syllabus</button></div>
          <div className="elc-programme"><span>&#9658; B.Eng. Computer Engineering</span><button>Curriculum & Syllabus</button></div>
          <div className="elc-programme"><span>&#9658; B.Eng. Agricultural Engineering</span><button>Curriculum & Syllabus</button></div>
        </section>


 {/* FACULTY */}
        <section className="elc-faculty" id="faculty" data-aos="fade-up">
          <h2>Our Faculty</h2>
          <div className="elc-faculty-grid">
            {[
              { img: home9, name: 'Prof. Adewale Johnson', desc: 'Dean of Engineering – Civil Infrastructure' },
              { img: home10, name: 'Dr. Bisi Oladimeji', desc: 'Head of Electrical Engineering – Renewable Energy Specialist' },
              { img: home1, name: 'Dr. Chinedu Okafor', desc: 'Senior Lecturer – Mechanical Systems and Robotics' },
            ].map((fac, idx) => (
              <div key={idx} className="elc-faculty-card">
                <img src={fac.img} alt={fac.name} />
                <h3>{fac.name}</h3>
                <p>{fac.desc}</p>
              </div>
            ))}
          </div>
        </section>

{/* INFRASTRUCTURE */}
        <section className="elc-infrastructure" id="infrastructure" data-aos="fade-up">
          <h2>Our Infrastructure</h2>
          <p>State-of-the-art labs, modern lecture halls, workshops, and digital libraries for innovation.</p>
        </section>

        {/* EVENTS */}
        <section className="elc-events" id="events" data-aos="fade-up">
          <h2>Campus Events</h2>
          <p>Engineering exhibitions, hackathons, seminars, and innovation challenges to foster creativity.</p>
        </section>



        <section className="elc-career" id="career" data-aos="fade-up">
  <div className="elc-career-img">
    <img src={careerImage} alt="Career" />
  </div>
  <div className="elc-career-text">
    <h2>Career Prospects</h2>
    <p>
      Our graduates are highly sought after in industries including civil, mechanical,
      electrical, computer engineering, and agricultural. Alumni have gone on to work
      with top Nigerian and international companies, government agencies, and startups.
    </p>
  </div>
</section>

        {/* TESTIMONIALS */}
        <section className="elc-testimonials" id="testimonials" data-aos="fade-up">
          <h2>What Our Students Say</h2>
          <Slider {...testimonialSettings}>
            <div className="elc-testimonial-card">
              <img src={home1} alt="Student 1" />
              <p>"Excellent teaching and facilities. I feel prepared for the industry."</p>
            </div>
            <div className="elc-testimonial-card">
              <img src={home9} alt="Student 2" />
              <p>"The professors are supportive and knowledgeable. SIWES gave me real experience."</p>
            </div>
            <div className="elc-testimonial-card">
              <img src={home10} alt="Student 3" />
              <p>"A vibrant campus life with great opportunities to grow."</p>
            </div>
          </Slider>
        </section>

          {/* SOCIAL */}
        <div className="elc-social-icons" data-aos="zoom-in">
          <a href="#"><AiFillFacebook /></a>
          <a href="#"><AiFillInstagram /></a>
          <a href="#"><AiFillTwitterCircle /></a>
        </div>

        {/* CONTACT FORM */}
        <section className="elc-contact" id="contact-form" data-aos="fade-up">
          <h2>Contact Us</h2>
          <div className="elc-contact-details">
            <p><FaMapMarkerAlt /> 123 College Road</p>
            <p><FaPhoneAlt /> +234 9054694470</p>
            <p><FaEnvelope /> sakaoluwasegun26@gmail.com</p>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button type="submit">Send</button>
          </form>
          {status && <p className="elc-status">{status}</p>}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="elc-footer" data-aos="fade-in">
        <p>&copy; 2025 SOF Engineering College. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default NewLanding;
