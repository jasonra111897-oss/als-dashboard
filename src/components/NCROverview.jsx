import React from "react";
import CountUp from "react-countup";
import "./NCROverview.css";

const NCROverview = ({ allData, onSelectDivision }) => {
  const hasData = allData && allData.length > 0;

  const sortedDivisions = hasData
    ? [...allData].sort((left, right) => right.totalImplementers - left.totalImplementers)
    : [];

  const ncrTotals = {
    schools: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalSchools || 0), 0)
      : 0,
    teachers: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalImplementers || 0), 0)
      : 0,
  };

  const featuredDivisions = sortedDivisions.slice(0, 6);

  const highestCoverageDivision = featuredDivisions[0] || null;
  const lowestCoverageDivision = hasData
    ? [...allData].sort((left, right) => left.totalImplementers - right.totalImplementers)[0]
    : null;
  const highestCoverageRatioDivision = hasData
    ? [...allData].sort((left, right) => {
        const leftRatio = Number(left.totalImplementers || 0) / Math.max(Number(left.totalSchools || 0), 1);
        const rightRatio =
          Number(right.totalImplementers || 0) / Math.max(Number(right.totalSchools || 0), 1);
        return rightRatio - leftRatio;
      })[0]
    : null;
  const averagePersonnel = hasData ? Math.round(ncrTotals.teachers / allData.length) : 0;
  const averageSchools = hasData ? Math.round(ncrTotals.schools / allData.length) : 0;
  const maxImplementers = sortedDivisions[0]?.totalImplementers || 1;
  const topFiveDivisions = sortedDivisions.slice(0, 5);

  return (
    <div className="ncr-overview-container">
      <div className="welcome-banner">
        <span className="section-kicker section-kicker-light">Regional Command Center</span>
        <h1 className="main-welcome-title">WELCOME TO THE ALS NCR DASHBOARD</h1>
        <p className="sub-welcome-text">
          National Capital Region operations, personnel coverage, and division-level access in one place.
        </p>
        <div className="overview-status-row">
          <span className="overview-status-pill">
            <strong>{hasData ? allData.length : 0}</strong> divisions monitored
          </span>
          <span className="overview-status-pill">
            <strong>{ncrTotals.teachers}</strong> ALS personnel tracked
          </span>
          <span className="overview-status-pill">
            <strong>{averagePersonnel}</strong> average personnel per division
          </span>
          <span className="overview-status-pill">
            <strong>Live workbook</strong> source active
          </span>
        </div>
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

        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Average Per Division</span>
          <span className="stat-value">
            <CountUp end={averagePersonnel} duration={2.5} separator="," />
          </span>
        </div>

        <div className="ncr-stat-item shadow-hover">
          <span className="stat-label">Average Schools</span>
          <span className="stat-value">
            <CountUp end={averageSchools} duration={2.5} separator="," />
          </span>
        </div>
      </div>

      <div className="overview-intelligence-layout">
        <div className="overview-region-panel">
          <div className="overview-region-panel-header">
            <span className="section-kicker">Regional Intelligence</span>
            <h2>Personnel strength across NCR divisions</h2>
            <p>Use this command view to compare division scale before opening an SDO dashboard.</p>
          </div>

          <div className="overview-bar-list">
            {topFiveDivisions.map((division, index) => {
              const implementers = Number(division.totalImplementers || 0);
              const width = `${Math.max(18, (implementers / maxImplementers) * 100)}%`;

              return (
                <button
                  key={division.divisionId || division.division}
                  type="button"
                  className="overview-bar-row"
                  onClick={() => onSelectDivision(division.division)}
                >
                  <div className="overview-bar-meta">
                    <span className="overview-bar-rank">#{index + 1}</span>
                    <div className="overview-bar-copy">
                      <strong>{division.division}</strong>
                      <small>
                        {implementers} implementers | {division.totalSchools} schools
                      </small>
                    </div>
                  </div>
                  <div className="overview-bar-track">
                    <span className="overview-bar-fill" style={{ width }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overview-signal-strip">
          <div className="overview-signal-card">
            <span className="stat-label">Strongest Personnel Presence</span>
            <strong>{highestCoverageDivision?.division || "Awaiting data"}</strong>
            <small>
              {highestCoverageDivision
                ? `${highestCoverageDivision.totalImplementers} implementers`
                : "No division data yet"}
            </small>
          </div>
          <div className="overview-signal-card">
            <span className="stat-label">Leanest Personnel Presence</span>
            <strong>{lowestCoverageDivision?.division || "Awaiting data"}</strong>
            <small>
              {lowestCoverageDivision
                ? `${lowestCoverageDivision.totalImplementers} implementers`
                : "No division data yet"}
            </small>
          </div>
          <div className="overview-signal-card">
            <span className="stat-label">Strongest Coverage Ratio</span>
            <strong>{highestCoverageRatioDivision?.division || "Awaiting data"}</strong>
            <small>
              {highestCoverageRatioDivision
                ? `${Math.round(
                    Number(highestCoverageRatioDivision.totalImplementers || 0) /
                      Math.max(Number(highestCoverageRatioDivision.totalSchools || 0), 1)
                  )} implementers per school`
                : "No coverage ratio data yet"}
            </small>
          </div>
          <div className="overview-signal-card">
            <span className="stat-label">Regional Explorer Hint</span>
            <strong>Open a division logo</strong>
            <small>Use the top rail or the ranked panels below to jump directly into each SDO.</small>
          </div>
        </div>
      </div>

      <div className="overview-explorer">
        <div className="overview-explorer-header">
          <span className="section-kicker">Division Explorer</span>
          <h2>Jump straight into the busiest divisions</h2>
          <p>
            Open a division card to move directly into its SDO dashboard with personnel and chart detail.
          </p>
        </div>

        <div className="overview-division-grid">
          {featuredDivisions.map((division, index) => {
            const coveragePerSchool = Math.round(
              Number(division.totalImplementers || 0) / Math.max(Number(division.totalSchools || 0), 1)
            );

            return (
              <button
                key={division.divisionId || division.division}
                type="button"
                className="overview-division-card shadow-hover"
                onClick={() => onSelectDivision(division.division)}
              >
                <div className="overview-division-card-topline">
                  <span className="overview-division-rank">#{index + 1}</span>
                  <span className="overview-division-coverage">{coveragePerSchool} per school</span>
                </div>
                <span className="overview-division-name">{division.division}</span>
                <div className="overview-division-metrics">
                  <span>{division.totalImplementers} implementers</span>
                  <span>{division.totalSchools} schools</span>
                </div>
                <span className="overview-division-link">Open division</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NCROverview;
