import React from "react";
import "./LoadingSpinner.css";
import logo from "../assets/engilogo.jpg"; 

const LoadingSpinner = () => {
  return (
    <div className="spinner-overlay">
      
      <div className="futuristic-spinner">
        <svg viewBox="0 0 100 100" className="spinner-svg">
          <circle
            className="spinner-ring"
            cx="50"
            cy="50"
            r="45"
            stroke="#00f0ff"
            strokeWidth="4"
            fill="none"
          />
          <circle
            className="spinner-track"
            cx="50"
            cy="50"
            r="45"
            stroke="#0050ff"
            strokeWidth="4"
            fill="none"
            strokeDasharray="282"
            strokeDashoffset="75"
          />
        </svg>
      </div>
      <p className="spinner-text">Initializing...</p>
    </div>
  );
};

export default LoadingSpinner;
