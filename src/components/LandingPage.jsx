import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="main-wrapper">
      <div className="grid-section">
        <div className="box image-text">
          <img src="/images/approach.jpg" alt="Our Approach" />
          <div className="overlay">
            <h2>Our Approach</h2>
            <p>This paragraph could be six lines max and needs to get your users get to know you.</p>
            <a href="#">Read More</a>
          </div>
        </div>
        <div className="box red-box">
          <h2>Announcements</h2>
          <p>This paragraph could be six lines max and needs to get your users get to know you.</p>
          <a href="#">Read More</a>
        </div>
        <div className="box image-text">
          <img src="/images/learning.jpg" alt="Learning" />
          <div className="overlay">
            <h2>Learning</h2>
            <p>This paragraph could be six lines max and needs to get your users get to know you.</p>
            <a href="#">Read More</a>
          </div>
        </div>
        <div className="box red-box">
          <h2>Events</h2>
          <p>This paragraph could be six lines max and needs to get your users get to know you.</p>
          <a href="#">Read More</a>
        </div>
        <div className="box image-only">
          <img src="/images/graduation.jpg" alt="Graduation" />
        </div>
        <div className="box red-box">
          <h2>About School of Law</h2>
          <p>This paragraph could be six lines max and needs to get your users get to know you.</p>
          <a href="#">Read More</a>
        </div>
        <div className="box image-only">
          <img src="/images/students.jpg" alt="Students" />
        </div>
      </div>

      <section className="features-section">
        <ul className="features-list">
          <li>Curriculum designed in consultation with eminent Academicians and High Court Judges (S3)</li>
          <li>Highly Qualified Staff – 10 Ph.d. Holders</li>
          <li>Approval of Curriculum by BoS and Academic Council</li>
          <li>Court / Chamber Visits</li>
          <li>Honors degree program with academic rigour</li>
          <li>Right balance of Theory & Practice</li>
          <li>Court Craft as course for Clinical Legal Education. MOOT court practice</li>
          <li>Mandatory internship in every semester</li>
          <li>20 Elective papers of Contemporary relevance</li>
          <li>Special courses to enhance communication skill</li>
        </ul>
      </section>

      <section className="programmes-section">
        <h3>Programmes Approved by Bar Council of Your Country</h3>
        <div className="programme">
          <span>&#9658; B.B.A.LL.B (Hons.) R2019 (Amended upto June 2020)</span>
          <button>Curriculum & Syllabus</button>
        </div>
        <div className="programme">
          <span>&#9658; B.A.LL.B (Hons.) R2019 (Amended upto June 2020)</span>
          <button>Curriculum & Syllabus</button>
        </div>
      </section>

      <section className="career-section">
        <div className="career-img">
          <img src="/images/career.jpg" alt="Career Opportunities" />
        </div>
        <div className="career-text">
          <h3>Career Opportunities</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nibh nec lectus nec. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. 
          </p>
          <p>
            Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nibh nec lectus nec.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;