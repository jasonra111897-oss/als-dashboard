import React from 'react';
import './TopNavigation.css'; // Import your new CSS file

const TopNavigation = ({ divisions, onCitySelect }) => {
  return (
    <header className="header-wrapper">
      <div className="mini-nav">
        <span>ALSPH</span>
        <span>Home</span>
        <span>About Us</span>
        <span>Resources</span>
        <span>Contact Us</span>
      </div>

      <div className="blue-bar">
        <div className="logo-group">
          <img src="/deped-ncr-logo.png" alt="DepEd" className="main-logo" />
          <div className="brand-text">
            <p>REPUBLIC OF THE PHILIPPINES</p>
            <h1>DEPARTMENT OF EDUCATION</h1>
            <p>NATIONAL CAPITAL REGION (NCR)</p>
          </div>
        </div>
        <img src="/als-logo.png" alt="ALS" className="side-logo" />
      </div>

      <div className="white-bar">
        <div className="breadcrumb">
          <span style={{ color: '#94a3b8' }}>YOU ARE HERE: </span>
          <span style={{ color: '#64748b', fontWeight: 'bold' }}>NCR DASHBOARD</span>
        </div>
        <div className="selector-area">
          <span className="view-label">VIEW DIVISION:</span>
          <select 
            onChange={(e) => onCitySelect(e.target.value)}
            className="dropdown"
          >
            <option value="">-- Select City --</option>
            {divisions.map((div, index) => (
              <option key={index} value={div.Division}>
                {div.Division}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="yellow-accent"></div>
    </header>
  );
};

export default TopNavigation;