import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import LearningStrandsChart from "./LearningStrandsChart";
import NCROverview from "./NCROverview";
import EnrollmentModal from "./EnrollmentModal";
import NCRMapModal from "./NCRMapModal";
import ALSShsMapModal from "./ALSShsMapModal";
import AboutALSModal from "./AboutALSModal";
import ClcshaDataPage from "./ClcshaDataPage";
import { getDivisionLogoSrc, getDivisionOfficeTitle } from "../constants/divisions";
import { fetchDashboardData, fetchEnrolmentData, fetchSchoolsData } from "../services/dataService";
import {
  formatNumber,
  formatWorkbookDate,
  getServiceWindowLabel,
  toDateValue,
} from "../utils/formatters";

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [showEnrolmentModal, setShowEnrolmentModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showShsMapModal, setShowShsMapModal] = useState(false);
  const [showAboutAlsModal, setShowAboutAlsModal] = useState(false);
  const [showClcshaDataPage, setShowClcshaDataPage] = useState(false);
  const [enrolmentData, setEnrolmentData] = useState(null);
  const [schoolsData, setSchoolsData] = useState(null);
  const [isEnrolmentLoading, setIsEnrolmentLoading] = useState(false);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [enrolmentError, setEnrolmentError] = useState("");
  const [schoolsError, setSchoolsError] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = useCallback(async () => {
    return fetchDashboardData();
  }, []);

  const closeSecondaryViews = () => {
    setShowAboutAlsModal(false);
    setShowEnrolmentModal(false);
    setShowMapModal(false);
    setShowShsMapModal(false);
    setShowClcshaDataPage(false);
  };

  const activeTopNavView = showClcshaDataPage
    ? "clcsha-data"
    : showAboutAlsModal
    ? "about"
    : showShsMapModal
      ? "schools-map"
      : showMapModal
        ? "division-map"
        : showEnrolmentModal
          ? "enrolment"
          : "regional";

  useEffect(() => {
    let ignore = false;

    const hydrateDashboard = async () => {
      try {
        setDashboardError("");
        const data = await loadDashboard();

        if (!ignore) {
          setAllData(data);
        }
      } catch (err) {
        if (!ignore) {
          setDashboardError(err.message || "Unable to load dashboard data.");
        }
      }
    };

    hydrateDashboard();

    return () => {
      ignore = true;
    };
  }, [loadDashboard]);

  const handleDataSourcesUpdated = useCallback(async () => {
    try {
      setDashboardError("");
      setEnrolmentData(null);
      setSchoolsData(null);
      setEnrolmentError("");
      setSchoolsError("");
      const data = await loadDashboard();
      setAllData(data);
    } catch (err) {
      setDashboardError(err.message || "Unable to refresh dashboard data after workbook upload.");
    }
  }, [loadDashboard]);

  const selectedCity =
    allData.find((division) => division.division === selectedDivision) || null;
  const selectedDivisionEnrolment =
    enrolmentData?.divisions?.find((division) => division.division === selectedDivision) || null;
  const selectedDivisionLogo = selectedCity ? getDivisionLogoSrc(selectedCity.division) : "";
  const selectedDivisionOfficeTitle = selectedCity
    ? getDivisionOfficeTitle(selectedCity.division)
    : "";
  const selectedDivisionTitleParts = selectedDivisionOfficeTitle.includes(" - ")
    ? selectedDivisionOfficeTitle.split(" - ")
    : ["Schools Division Office", selectedCity?.division || ""];

  useEffect(() => {
    let ignore = false;

    if (!selectedDivision || enrolmentData) {
      return undefined;
    }

    const prefetchEnrolment = async () => {
      try {
        const data = await fetchEnrolmentData();

        if (!ignore) {
          setEnrolmentData(data);
        }
      } catch {
        // Keep the division page usable even if enrolment data is unavailable.
      }
    };

    prefetchEnrolment();

    return () => {
      ignore = true;
    };
  }, [selectedDivision, enrolmentData]);

  const handleOpenEnrolment = async () => {
    closeSecondaryViews();
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
    closeSecondaryViews();
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

  const handleOpenAboutAls = () => {
    closeSecondaryViews();
    setShowAboutAlsModal(true);
  };

  const handleOpenClcshaData = () => {
    closeSecondaryViews();
    setShowClcshaDataPage(true);
  };

  const handleOpenDivisionMap = () => {
    closeSecondaryViews();
    setShowMapModal(true);
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
  const divisionTeacherInsights = useMemo(() => {
    if (!selectedCity) {
      return null;
    }

    const teacherList = selectedCity.teacherList || [];
    const learnerLoads = teacherList.map((teacher) => Number(teacher.currentEnrollees || 0));
    const datedTeachers = teacherList
      .map((teacher) => ({
        name: teacher.name,
        date: toDateValue(teacher.serviceFrom),
      }))
      .filter((teacher) => teacher.date);

    const newestTeacher = datedTeachers.sort((left, right) => right.date - left.date)[0] || null;

    return {
      averageEnrolleesPerTeacher: teacherList.length
        ? Math.round(learnerLoads.reduce((sum, value) => sum + value, 0) / teacherList.length)
        : 0,
      highestTeacherLoad: learnerLoads.length ? Math.max(...learnerLoads) : 0,
      newestTeacherLabel: newestTeacher
        ? `${newestTeacher.name.split(",")[0]} - ${formatWorkbookDate(newestTeacher.date)}`
        : "No service history recorded",
      leadingRole,
      selectedRoleCount: topRoles[0]?.[1] || 0,
      rankLabel: selectedDivisionEnrolment
        ? `${formatNumber(selectedDivisionEnrolment.grandTotal.total)} enrolled learners`
        : "Waiting for enrolment data",
    };
  }, [leadingRole, selectedCity, selectedDivisionEnrolment, topRoles]);

  const handleOpenShsMap = async () => {
    closeSecondaryViews();
    setShowShsMapModal(true);

    try {
      setIsSchoolsLoading(true);
      setSchoolsError("");

      if (!schoolsData) {
        const data = await fetchSchoolsData();
        setSchoolsData(data);
      }
    } catch (err) {
      setSchoolsError(err.message || "Unable to load ALS SHS schools data.");
    } finally {
      setIsSchoolsLoading(false);
    }
  };

  if (dashboardError && !allData.length) {
    return (
      <div className="error-screen">
        <div className="dashboard-state-card dashboard-state-card-error">
          <span className="section-kicker">Dashboard Unavailable</span>
          <h2>Unable to load dashboard data</h2>
          <p>{dashboardError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <TopNavigation
        divisions={allData}
        onCitySelect={handleCityChange}
        onHomeClick={resetToHome}
        onAboutClick={handleOpenAboutAls}
        onEnrolmentClick={handleOpenEnrolment}
        onMapClick={handleOpenDivisionMap}
        onShsMapClick={handleOpenShsMap}
        onClcshaDataClick={handleOpenClcshaData}
        currentSelection={selectedDivision}
        activeView={activeTopNavView}
      />

      <main
        className={`dashboard-content ${
          showClcshaDataPage ? "dashboard-content-clc" : ""
        } ${!selectedCity && activeTopNavView === "regional" ? "dashboard-content-home" : ""} ${
          activeTopNavView === "about" ? "dashboard-content-about" : ""
        } ${
          activeTopNavView === "division-map" || activeTopNavView === "schools-map"
            ? "dashboard-content-map"
            : ""
        } ${
          selectedCity && activeTopNavView === "regional" ? "dashboard-content-division" : ""
        }`.trim()}
      >
        {showClcshaDataPage ? (
          <ClcshaDataPage onSourcesUpdated={handleDataSourcesUpdated} />
        ) : showAboutAlsModal ? (
          <AboutALSModal
            isOpen={showAboutAlsModal}
            onClose={() => setShowAboutAlsModal(false)}
            inlineMode
          />
        ) : showEnrolmentModal ? (
          <EnrollmentModal
            key={`enrolment-inline-${selectedDivision || "regional-home"}`}
            isOpen={showEnrolmentModal}
            onClose={() => setShowEnrolmentModal(false)}
            onHomeClick={resetToHome}
            enrolmentData={enrolmentData}
            isLoading={isEnrolmentLoading}
            error={enrolmentError}
            currentDivision={selectedDivision}
            inlineMode
          />
        ) : showMapModal ? (
          <NCRMapModal
            key={`map-inline-${selectedDivision || "regional-home"}`}
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
            divisions={allData}
            currentDivision={selectedDivision}
            inlineMode
          />
        ) : showShsMapModal ? (
          <ALSShsMapModal
            key={`shs-map-inline-${selectedDivision || "regional-home"}`}
            isOpen={showShsMapModal}
            onClose={() => setShowShsMapModal(false)}
            currentDivision={selectedDivision}
            divisions={allData}
            schoolsData={schoolsData}
            isLoading={isSchoolsLoading}
            error={schoolsError}
            inlineMode
          />
        ) : selectedCity ? (
          <div className="division-page">
            <section className="division-hero">
              <div className="division-hero-copy">
                <div className="division-office-header">
                  <div className="division-office-logo-shell">
                    {selectedDivisionLogo ? (
                      <img
                        src={selectedDivisionLogo}
                        alt={`${selectedCity.division} division logo`}
                        className="division-office-logo"
                      />
                    ) : (
                      <span className="division-office-logo-fallback">
                        {String(selectedCity.division || "").charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="division-office-copy">
                    <p className="division-office-kicker">Republic of the Philippines</p>
                    <div className="division-office-rule" />
                    <h2>
                      <span>{selectedDivisionTitleParts[0]}</span>
                      <strong>{selectedDivisionTitleParts.slice(1).join(" - ")}</strong>
                    </h2>
                  </div>
                </div>
              </div>

            </section>

            <div className="division-page-body">
            <div className="insight-layout">
              <LearningStrandsChart cityData={selectedCity} />

              <aside className="division-side-stats">
                <StatCards
                  cityData={selectedCity}
                  divisionEnrolment={selectedDivisionEnrolment}
                  divisionInsights={divisionTeacherInsights}
                />
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

              <div className="teacher-grid">
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
                            serviceFrom: teacher?.serviceFrom || "",
                            serviceTo: teacher?.serviceTo || "",
                            currentEnrollees: teacher?.currentEnrollees || 0,
                          })
                        }
                      >
                        <div className="teacher-avatar">{initials || "AL"}</div>
                        <div className="teacher-info">
                          <span className="teacher-name">{displayName}</span>
                          <span className="teacher-badge">{position}</span>
                          <div className="teacher-detail-list">
                            <span className="teacher-detail-line">
                              <strong>Service:</strong>{" "}
                              {getServiceWindowLabel(teacher?.serviceFrom, teacher?.serviceTo)}
                            </span>
                            <span className="teacher-detail-line">
                              <strong>Current Enrollees:</strong> {teacher?.currentEnrollees || 0}
                            </span>
                          </div>
                          <div className="teacher-meta-row">
                            <span className="teacher-meta-pill">
                              {teacher?.currentEnrollees || 0} learners
                            </span>
                            <span className="teacher-meta-pill teacher-meta-pill-secondary">
                              {getServiceWindowLabel(teacher?.serviceFrom, teacher?.serviceTo)}
                            </span>
                          </div>
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
            </div>
          </div>
        ) : (
          <NCROverview
            allData={allData}
            onSelectDivision={handleCityChange}
          />
        )}

        {!showAboutAlsModal &&
        !showEnrolmentModal &&
        !showMapModal &&
        !showShsMapModal &&
        !showClcshaDataPage &&
        selectedTeacher ? (
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
                <div className="profile-highlights">
                  <div className="profile-highlight-card">
                    <span>Position</span>
                    <strong>{selectedTeacher.position}</strong>
                  </div>
                  <div className="profile-highlight-card">
                    <span>Current Enrollees</span>
                    <strong>{selectedTeacher.currentEnrollees || 0}</strong>
                  </div>
                  <div className="profile-highlight-card">
                    <span>Service Window</span>
                    <strong>{getServiceWindowLabel(selectedTeacher.serviceFrom, selectedTeacher.serviceTo)}</strong>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail-row">
                    <strong>Position:</strong>
                    <span>{selectedTeacher.position}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Service From:</strong>
                    <span>{formatWorkbookDate(selectedTeacher.serviceFrom) || "Not provided"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Service To:</strong>
                    <span>{selectedTeacher.serviceTo || "Not provided"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Current Enrollees:</strong>
                    <span>{selectedTeacher.currentEnrollees || 0}</span>
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
      </main>
    </div>
  );
};

export default Dashboard;
