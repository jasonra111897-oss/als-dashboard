import React from 'react';
import './StatCards.css'; // Import the new CSS file

const StatCards = ({ cityData }) => {
  // Safety check to prevent the "Cannot read properties of null" error
  if (!cityData) return null;

  return (
    <div className="stat-grid">
      <div className="stat-card border-blue">
        <h3 className="stat-title">TOTAL SCHOOLS</h3>
        <p className="stat-number">{cityData.totalSchools || 0}</p>
        <span className="stat-subtext">Registered Centers</span>
      </div>
      
      {/* Total Implementers uses a zero fallback */}
      <div className="stat-card border-green">
        <h3 className="stat-title">TOTAL IMPLEMENTERS</h3>
        <p className="stat-number">{cityData.totalImplementers || 0}</p>
        <span className="stat-subtext">Active Personnel</span>
      </div>

      <div className="stat-card border-orange">
        <h3 className="stat-title">ACTIVE STATUS</h3>
        <p className="stat-number">{cityData.activeDivisions || 0}</p>
        <span className="stat-subtext">Current Selection</span>
      </div>
    </div>
  );
};

export default StatCards;
