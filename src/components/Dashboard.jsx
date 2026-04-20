import React, { useEffect, useState } from "react";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import LearningStrandsChart from "./LearningStrandsChart";
import NCROverview from "./NCROverview";
import EnrollmentModal from "./EnrollmentModal";
import { fetchDashboardData, fetchEnrolmentData } from "../services/dataService";
import "./Dashboard.css";
import "./TopNavigation.css";
import "./StatCards.css";

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [registryView, setRegistryView] = useState("grid");
  const [showEnrolmentModal, setShowEnrolmentModal] = useState(false);
  const [enrolmentData, setEnrolmentData] = useState(null);
  const [isEnrolmentLoading, setIsEnrolmentLoading] = useState(false);
  const [enrolmentError, setEnrolmentError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setDashboardError("");
        const data = await fetchDashboardData();

        if (!ignore) {
          setAllData(data);
        }
      } catch (err) {
        if (!ignore) {
          setDashboardError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedCity =
    allData.find((division) => division.division === selectedDivision) || null;

  const handleOpenEnrolment = async () => {
    setShowEnrolmentModal(true);

    try {
      setIsEnrolmentLoading(true);
      setEnrolmentError("");

      if (!enrolmentData) {
        const data = await fetchEnrolmentData();
        setEnrolmentData(data);
      }
    } catch (err) {
      if (String(err.message || "").includes("404")) {
        setEnrolmentError(
          "ALS enrolment data is not available from the backend yet. Restart the backend server so the new /api/enrolment route is loaded."
        );
      } else {
        setEnrolmentError(err.message || "Unable to load enrolment data.");
      }
    } finally {
      setIsEnrolmentLoading(false);
    }
  };

  const resetToHome = () => {
    setSelectedDivision("");
    setSearchTerm("");
    setSelectedTeacher(null);
    setPositionFilter("All Positions");
    setSortOrder("name-asc");
  };

  const handleCityChange = (divisionName) => {
    if (!divisionName) {
      resetToHome();
      return;
    }

    setSelectedDivision(divisionName);
    setSelectedTeacher(null);
    setSearchTerm("");
    setPositionFilter("All Positions");
    setSortOrder("name-asc");
  };

  const positionCounts = (selectedCity?.teacherList || []).reduce((counts, teacher) => {
    const position = teacher?.position || "Unassigned";
    counts[position] = (counts[position] || 0) + 1;
    return counts;
  }, {});

  const positionOptions = Object.entries(positionCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([position]) => position);

  const filteredTeachers = (selectedCity?.teacherList || [])
    .filter((teacher) => {
      if (!teacher) return false;

      const nameToSearch = String(teacher.name || "").toLowerCase();
      const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase());
      const matchesPosition =
        positionFilter === "All Positions" ||
        (teacher?.position || "Unassigned") === positionFilter;

      return matchesSearch && matchesPosition;
    })
    .sort((left, right) => {
      const leftName = String(left?.name || "");
      const rightName = String(right?.name || "");
      const leftPosition = String(left?.position || "");
      const rightPosition = String(right?.position || "");

      switch (sortOrder) {
        case "name-desc":
          return rightName.localeCompare(leftName);
        case "position-asc":
          return leftPosition.localeCompare(rightPosition) || leftName.localeCompare(rightName);
        case "position-desc":
          return rightPosition.localeCompare(leftPosition) || leftName.localeCompare(rightName);
        case "name-asc":
        default:
          return leftName.localeCompare(rightName);
      }
    });

  const topRoles = Object.entries(positionCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3);

  const leadingRole = topRoles[0]?.[0] || "ALS Implementer";
  const averageLoad = selectedCity
    ? Math.max(
        1,
        Math.round(selectedCity.totalImplementers / Math.max(selectedCity.totalSchools, 1))
      )
    : 0;

  if (isLoading) {
    return <div className="loading-screen">Loading ALS NCR Dashboard...</div>;
  }

  if (dashboardError) {
    return <div className="error-screen">Unable to load dashboard data: {dashboardError}</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <TopNavigation
        divisions={allData}
        onCitySelect={handleCityChange}
        onHomeClick={resetToHome}
        onEnrolmentClick={handleOpenEnrolment}
        currentSelection={selectedDivision}
      />

      <main className="dashboard-content">
        {selectedCity ? (
          <>
            <section className="division-hero">
              <div className="division-hero-copy">
                <span className="section-kicker">Division Command View</span>
                <h2>{selectedCity.division}</h2>
                <p>
                  Monitor personnel coverage, inspect position mix, and move through
                  the registry using faster filters and navigation controls.
                </p>
                <div className="hero-actions">
                  <button type="button" className="hero-button hero-button-primary" onClick={resetToHome}>
                    Home
                  </button>
                  <button
                    type="button"
                    className="hero-button hero-button-secondary"
                    onClick={handleOpenEnrolment}
                  >
                    ALS Enrolment 2025-2026
                  </button>
                  <button
                    type="button"
                    className="hero-button hero-button-secondary"
                    onClick={() =>
                      setRegistryView((currentView) =>
                        currentView === "grid" ? "compact" : "grid"
                      )
                    }
                  >
                    {registryView === "grid" ? "Compact Registry" : "Card Registry"}
                  </button>
                </div>
              </div>

              <div className="division-hero-panel">
                <div className="hero-panel-card">
                  <span className="hero-panel-label">Leading Role</span>
                  <strong>{leadingRole}</strong>
                </div>
                <div className="hero-panel-card">
                  <span className="hero-panel-label">Coverage Ratio</span>
                  <strong>{averageLoad} implementers / school</strong>
                </div>
                <div className="hero-panel-card">
                  <span className="hero-panel-label">Current Results</span>
                  <strong>{filteredTeachers.length} visible personnel</strong>
                </div>
              </div>
            </section>

            <StatCards cityData={selectedCity} />

            <div className="insight-layout">
              <LearningStrandsChart cityData={selectedCity} />

              <aside className="insight-panel">
                <div className="insight-panel-header">
                  <span className="section-kicker section-kicker-light">Top Roles</span>
                  <h3>Personnel Mix</h3>
                </div>
                <div className="role-stack">
                  {topRoles.length > 0 ? (
                    topRoles.map(([role, count]) => (
                      <button
                        key={role}
                        type="button"
                        className={`role-chip ${positionFilter === role ? "active" : ""}`}
                        onClick={() => setPositionFilter(role)}
                      >
                        <span>{role}</span>
                        <strong>{count}</strong>
                      </button>
                    ))
                  ) : (
                    <p className="role-empty">No role data available for this division.</p>
                  )}
                </div>
                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={() => setPositionFilter("All Positions")}
                >
                  Show All Positions
                </button>
              </aside>
            </div>

            <div className="registry-card">
              <div className="registry-header">
                <div className="header-text">
                  <h3>PERSONNEL REGISTRY: {selectedCity.division}</h3>
                  <p>Active Alternative Learning System (ALS) Implementers</p>
                </div>
                <span className="registry-count">{filteredTeachers.length} records</span>
              </div>

              <div className="registry-toolbar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search personnel name..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="toolbar-select-group">
                  <label htmlFor="sort-order">Sort</label>
                  <select
                    id="sort-order"
                    className="toolbar-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="position-asc">Position A-Z</option>
                    <option value="position-desc">Position Z-A</option>
                  </select>
                </div>
              </div>

              <div className="position-filter-row">
                <button
                  type="button"
                  className={`filter-pill ${positionFilter === "All Positions" ? "active" : ""}`}
                  onClick={() => setPositionFilter("All Positions")}
                >
                  All Positions
                </button>
                {positionOptions.map((position) => (
                  <button
                    key={position}
                    type="button"
                    className={`filter-pill ${positionFilter === position ? "active" : ""}`}
                    onClick={() => setPositionFilter(position)}
                  >
                    {position}
                  </button>
                ))}
              </div>

              <div className={`teacher-grid ${registryView === "compact" ? "teacher-grid-compact" : ""}`}>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher, index) => {
                    const displayName = teacher?.name || "Unknown Personnel";
                    const position = teacher?.position || "ALS Implementer";
                    const initials = displayName
                      .split(",")
                      .map((part) => part.trim().charAt(0))
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("");

                    return (
                      <button
                        type="button"
                        key={teacher?.id || index}
                        className="teacher-item clickable"
                        onClick={() =>
                          setSelectedTeacher({
                            name: displayName,
                            division: selectedCity.division,
                            position,
                          })
                        }
                      >
                        <div className="teacher-avatar">{initials || "AL"}</div>
                        <div className="teacher-info">
                          <span className="teacher-name">{displayName}</span>
                          <span className="teacher-badge">{position}</span>
                        </div>
                        <span className="teacher-action">View</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <p>No personnel records match the current search and position filters.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <NCROverview allData={allData} onSelectDivision={handleCityChange} />
        )}

        {selectedTeacher ? (
          <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Personnel Profile</h2>
                <button className="close-btn" onClick={() => setSelectedTeacher(null)}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="profile-avatar">{String(selectedTeacher.name).charAt(0)}</div>
                <h1 className="profile-name">{selectedTeacher.name}</h1>
                <p className="profile-division">{selectedTeacher.division}</p>
                <div className="profile-details">
                  <div className="detail-row">
                    <strong>Position:</strong>
                    <span>{selectedTeacher.position}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span className="status-badge">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <EnrollmentModal
          isOpen={showEnrolmentModal}
          onClose={() => setShowEnrolmentModal(false)}
          enrolmentData={enrolmentData}
          isLoading={isEnrolmentLoading}
          error={enrolmentError}
        />
      </main>
    </div>
  );
};

export default Dashboard;
