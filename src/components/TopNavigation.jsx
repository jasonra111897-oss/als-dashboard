import React from "react";
import "./TopNavigation.css";

const TopNavigation = ({ divisions, onCitySelect, onHomeClick, currentSelection }) => {
  return (
    <header className="top-nav-container">
      {/* Topmost Utility Bar */}
      <div className="utility-bar">
        <div className="utility-links">
          <span onClick={onHomeClick} className="clickable-link">Home</span>
          <span>About Us</span>
          <span>Resources</span>
          <span>Contact Us</span>
        </div>
      </div>

     
      <div className="main-banner">
        <div className="banner-left" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          
          <img src="/deped.png" alt="DepEd Logo" className="deped-logo-img" />
          <div className="banner-text">
            <p className="republic-text">REPUBLIC OF THE PHILIPPINES</p>
            <h1 className="dept-text">DEPARTMENT OF EDUCATION</h1>
            <p className="region-text">NATIONAL CAPITAL REGION </p>
          </div>
        </div>
        <div className="banner-right">
          
          <img src="/als.png" alt="ALS Logo" className="als-logo-img" />
        </div>
      </div>

      {/* Breadcrumb and Dropdown Section */}
      <div className="selection-bar">
        <div className="breadcrumb">
          YOU ARE HERE: <span className="breadcrumb-active">ALTERNATIVE LEARNING SYSTEM DASHBOARD</span>
        </div>
        
        <div className="dropdown-section">
          <label htmlFor="city-select">VIEW DIVISION:</label>
          <select 
            id="city-select" 
            className="city-dropdown"
            value={currentSelection} 
            onChange={(e) => onCitySelect(e.target.value)}
          >
            <option value="">-- Select City --</option>
            {divisions.map((city, index) => (
              <option key={index} value={city.Division}>
                {city.Division.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;