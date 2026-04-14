import React from "react";
import CountUp from 'react-countup'; // Ensure you ran 'npm install react-countup'

const NCROverview = ({ allData }) => {
  // Check if data exists before calculating
  const hasData = allData && allData.length > 0;

  // Calculate totals for the entire National Capital Region
  const ncrTotals = {
    schools: hasData 
      ? allData.reduce((sum, city) => sum + parseInt(city.TotalSchools || 0), 0) 
      : 0,
    teachers: hasData 
      ? allData.reduce((sum, city) => sum + parseInt(city.TotalImplementers || 0), 0) 
      : 0
  };

  return (
    <div className="ncr-overview-container">
      {/* Welcome Section with subtle entry animation */}
      <div className="welcome-banner">
        <h1 className="main-welcome-title">Welcome to the ALS NCR Dashboard</h1>
        <p className="sub-welcome-text">National Capital Region Operations & Personnel Registry</p>
      </div>

      {/* Stunning Stat Cards with Animated Counters */}
      <div className="ncr-stats-summary">
        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Total Regional Schools</span>
          <span className="stat-value">
            {/* Animated Counter for Schools */}
            <CountUp end={ncrTotals.schools} duration={2.5} separator="," />
          </span>
        </div>

        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Total Regional Personnel</span>
          <span className="stat-value">
            {/* Animated Counter for Personnel */}
            <CountUp end={ncrTotals.teachers} duration={2.5} separator="," />
          </span>
        </div>
      </div>

      {/* Contextual Instruction Box */}
      <div className="selection-instruction-card">
        <div className="info-icon-wrapper">
          <span className="info-icon">i</span>
        </div>
        <p className="instruction-text">
          Please select a specific <strong>Division</strong> from the dropdown menu above 
          to view localized data and personnel registries.
        </p>
      </div>
    </div>
  );
};

export default NCROverview;