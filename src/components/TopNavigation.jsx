import React from "react";
import "./TopNavigation.css";

const TopNavigation = ({
  divisions,
  onCitySelect,
  onHomeClick,
  onEnrolmentClick,
  onMapClick,
  currentSelection,
}) => {
  return (
    <header className="top-nav-container">
      <div className="utility-bar">
        <div className="utility-links">
          <button type="button" className="utility-button active" onClick={onHomeClick}>
            Home
          </button>
          <button type="button" className="utility-button" onClick={onHomeClick}>
            Regional Overview
          </button>
          <button type="button" className="utility-button" onClick={onEnrolmentClick}>
            ALS Enrolment 2025-2026
          </button>
          <button type="button" className="utility-button" onClick={onMapClick}>
            NCR Division Map
          </button>
          {currentSelection ? (
            <button type="button" className="utility-button utility-button-current">
              {currentSelection}
            </button>
          ) : null}
        </div>

        <div className="utility-meta">
          <span className="utility-pill">{divisions.length} divisions</span>
          <span className="utility-pill utility-pill-highlight">ALS NCR live dashboard</span>
        </div>
      </div>

      <div className="main-banner">
        <div className="banner-left" onClick={onHomeClick} style={{ cursor: "pointer" }}>
          <img src="/deped.png" alt="DepEd Logo" className="deped-logo-img" />
          <div className="banner-text">
            <p className="republic-text">REPUBLIC OF THE PHILIPPINES</p>
            <h1 className="dept-text">DEPARTMENT OF EDUCATION</h1>
            <p className="region-text">NATIONAL CAPITAL REGION</p>
          </div>
        </div>

        <div className="banner-right">
          <img src="/als.png" alt="ALS Logo" className="als-logo-img" />
        </div>
      </div>

      <div className="selection-bar">
        <div className="selection-copy">
          <div className="breadcrumb">
            YOU ARE HERE: <span className="breadcrumb-active">ALTERNATIVE LEARNING SYSTEM DASHBOARD</span>
          </div>
        </div>

        <div className="dropdown-section">
          <label htmlFor="city-select">View Division</label>
          <select
            id="city-select"
            className="city-dropdown"
            value={currentSelection}
            onChange={(e) => onCitySelect(e.target.value)}
          >
            <option value="">Regional Home</option>
            {divisions.map((division) => (
              <option key={division.divisionId || division.division} value={division.division}>
                {division.division}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
