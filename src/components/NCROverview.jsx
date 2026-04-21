import React from "react";
import CountUp from "react-countup";

const NCROverview = ({ allData, onSelectDivision }) => {
  const hasData = allData && allData.length > 0;

  const ncrTotals = {
    schools: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalSchools || 0), 0)
      : 0,
    teachers: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalImplementers || 0), 0)
      : 0,
  };

  const featuredDivisions = hasData
    ? [...allData]
        .sort((left, right) => right.totalImplementers - left.totalImplementers)
        .slice(0, 6)
    : [];

  return (
    <div className="ncr-overview-container">
      <div className="welcome-banner">
        <h1 className="main-welcome-title">Welcome to the ALS NCR Dashboard</h1>
        <p className="sub-welcome-text">
          National Capital Region operations, personnel coverage, and division-level access in one place.
        </p>
      </div>

      <div className="ncr-stats-summary">
        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Total Regional Schools</span>
          <span className="stat-value">
            <CountUp end={ncrTotals.schools} duration={2.5} separator="," />
          </span>
        </div>

        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Total Regional Personnel</span>
          <span className="stat-value">
            <CountUp end={ncrTotals.teachers} duration={2.5} separator="," />
          </span>
        </div>
      </div>

      <div className="selection-instruction-card">
        <p className="instruction-text">
          Select a <strong>Division</strong> from the top navigation or jump into one of the busiest NCR divisions below.
        </p>
      </div>

      <div className="overview-explorer">
        <div className="overview-explorer-header">
          <span className="section-kicker">Division Explorer</span>
          <h2>Jump straight into the busiest divisions</h2>
        </div>

        <div className="overview-division-grid">
          {featuredDivisions.map((division) => (
            <button
              key={division.divisionId || division.division}
              type="button"
              className="overview-division-card shadow-hover"
              onClick={() => onSelectDivision(division.division)}
            >
              <span className="overview-division-name">{division.division}</span>
              <div className="overview-division-metrics">
                <span>{division.totalImplementers} implementers</span>
                <span>{division.totalSchools} schools</span>
              </div>
              <span className="overview-division-link">Open division</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NCROverview;
