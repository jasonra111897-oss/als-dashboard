import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import LearningStrandsChart from "./LearningStrandsChart";
import NCROverview from "./NCROverview";
import EnrollmentModal from "./EnrollmentModal";
import NCRMapModal from "./NCRMapModal";
import { fetchDashboardData, fetchEnrolmentData } from "../services/dataService";
import "./Dashboard.css";
import "./TopNavigation.css";
import "./StatCards.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DIVISION_COLOR_RAMP = [
  "rgba(23, 59, 120, 0.9)",
  "rgba(28, 76, 149, 0.88)",
  "rgba(35, 87, 159, 0.86)",
  "rgba(41, 101, 178, 0.84)",
  "rgba(47, 115, 197, 0.82)",
  "rgba(59, 143, 225, 0.82)",
  "rgba(76, 154, 229, 0.8)",
  "rgba(96, 166, 232, 0.78)",
  "rgba(116, 178, 235, 0.76)",
  "rgba(136, 190, 238, 0.74)",
  "rgba(156, 201, 241, 0.74)",
  "rgba(176, 213, 244, 0.72)",
  "rgba(196, 224, 247, 0.72)",
  "rgba(216, 236, 250, 0.7)",
  "rgba(202, 223, 248, 0.72)",
  "rgba(184, 209, 242, 0.74)",
];

const getDivisionLogoSrc = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const logoMap = {
    CALOOCAN: "/caloocan.png",
    "LAS PI\u00d1AS": encodeURI("/las pi\u00f1as.png"),
    MAKATI: "/makati.png",
    MALABON: "/malabon.png",
    MANDALUYONG: "/mandaluyong.png",
    MANILA: "/manila.png",
    MARIKINA: "/marikina.png",
    MUNTINLUPA: "/muntinlupa.png",
    NAVOTAS: "/navotas.png",
    PARA\u00d1AQUE: encodeURI("/para\u00f1aque.png"),
    PASAY: "/pasay.png",
    PASIG: "/pasig.png",
    "QUEZON CITY": encodeURI("/quezon city.jpg"),
    "SAN JUAN": encodeURI("/san juan.png"),
    "TAGUIG CITY & PATEROS": encodeURI("/taguig&pateros.png"),
    VALENZUELA: "/valenzuela.png",
  };

  return logoMap[normalized] || "";
};

const getDivisionOfficeTitle = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const displayNames = {
    CALOOCAN: "Schools Division Office - Caloocan City",
    "LAS PI\u00d1AS": "Schools Division Office - Las Pi\u00f1as City",
    MAKATI: "Schools Division Office - Makati City",
    MALABON: "Schools Division Office - Malabon City",
    MANDALUYONG: "Schools Division Office - Mandaluyong City",
    MANILA: "Schools Division Office - Manila",
    MARIKINA: "Schools Division Office - Marikina City",
    MUNTINLUPA: "Schools Division Office - Muntinlupa City",
    NAVOTAS: "Schools Division Office - Navotas City",
    PARA\u00d1AQUE: "Schools Division Office - Para\u00f1aque City",
    PASAY: "Schools Division Office - Pasay City",
    PASIG: "Schools Division Office - Pasig City",
    "QUEZON CITY": "Schools Division Office - Quezon City",
    "SAN JUAN": "Schools Division Office - San Juan City",
    "TAGUIG CITY & PATEROS": "Schools Division Office - Taguig City and Pateros",
    VALENZUELA: "Schools Division Office - Valenzuela City",
  };

  return displayNames[normalized] || `Schools Division Office - ${normalized}`;
};

const formatWorkbookDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const utcMillis = Math.round((value - 25569) * 86400 * 1000);
    const date = new Date(utcMillis);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime()) && /\d/.test(String(value))) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  }

  return String(value).replace(/\s+/g, " ").trim();
};

const getServiceWindowLabel = (serviceFrom, serviceTo) => {
  const fromLabel = formatWorkbookDate(serviceFrom);
  const toLabel = String(serviceTo || "").trim();

  if (fromLabel && toLabel) {
    return `${fromLabel} to ${toLabel}`;
  }

  if (fromLabel) {
    return `Since ${fromLabel}`;
  }

  if (toLabel) {
    return `Until ${toLabel}`;
  }

  return "Service dates not provided";
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [registryView, setRegistryView] = useState("grid");
  const [showEnrolmentModal, setShowEnrolmentModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [enrolmentData, setEnrolmentData] = useState(null);
  const [isEnrolmentLoading, setIsEnrolmentLoading] = useState(false);
  const [enrolmentError, setEnrolmentError] = useState("");
  const [isDashboardEnrolmentLoading, setIsDashboardEnrolmentLoading] = useState(false);
  const [dashboardEnrolmentError, setDashboardEnrolmentError] = useState("");
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
  const selectedDivisionEnrolment =
    enrolmentData?.divisions?.find((division) => division.division === selectedDivision) || null;
  const selectedDivisionLogo = selectedCity ? getDivisionLogoSrc(selectedCity.division) : "";
  const selectedDivisionOfficeTitle = selectedCity
    ? getDivisionOfficeTitle(selectedCity.division)
    : "";

  useEffect(() => {
    let ignore = false;

    if (!selectedDivision || enrolmentData) {
      return undefined;
    }

    const prefetchEnrolment = async () => {
      try {
        setIsDashboardEnrolmentLoading(true);
        setDashboardEnrolmentError("");
        const data = await fetchEnrolmentData();

        if (!ignore) {
          setEnrolmentData(data);
        }
      } catch (err) {
        if (!ignore) {
          setDashboardEnrolmentError(err.message || "Unable to load enrolment data.");
        }
      } finally {
        if (!ignore) {
          setIsDashboardEnrolmentLoading(false);
        }
      }
    };

    prefetchEnrolment();

    return () => {
      ignore = true;
    };
  }, [selectedDivision, enrolmentData]);

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

  const regionalEnrolmentChartData = useMemo(() => {
    if (!enrolmentData?.divisions?.length) {
      return null;
    }

    return {
      labels: enrolmentData.divisions.map((division) => division.division),
      datasets: [
        {
          label: "Total Enrollees",
          data: enrolmentData.divisions.map((division) => division.grandTotal.total),
          backgroundColor: enrolmentData.divisions.map((division, index) =>
            division.division === selectedDivision
              ? "rgba(244, 180, 56, 0.96)"
              : DIVISION_COLOR_RAMP[index % DIVISION_COLOR_RAMP.length]
          ),
          borderColor: enrolmentData.divisions.map((division) =>
            division.division === selectedDivision ? "rgba(180, 120, 9, 1)" : "rgba(23, 59, 120, 0)"
          ),
          borderWidth: enrolmentData.divisions.map((division) =>
            division.division === selectedDivision ? 2 : 0
          ),
          borderRadius: 12,
          maxBarThickness: 34,
        },
      ],
    };
  }, [enrolmentData, selectedDivision]);

  const regionalEnrolmentChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Regional Enrolment Across 16 Divisions",
          color: "#10213d",
          font: {
            size: 18,
            weight: "700",
          },
          padding: {
            bottom: 14,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${formatNumber(context.parsed.y)} total enrollees`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            callback: (value) => formatNumber(value),
          },
          grid: {
            color: "rgba(15, 23, 42, 0.08)",
          },
        },
        x: {
          ticks: {
            maxRotation: 40,
            minRotation: 40,
            color: "#5b6f88",
            font: {
              size: 11,
              weight: "600",
            },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    []
  );

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
        onMapClick={() => setShowMapModal(true)}
        currentSelection={selectedDivision}
      />

      <main className="dashboard-content">
        {selectedCity ? (
          <>
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
                    <h2>{selectedDivisionOfficeTitle}</h2>
                    <p className="division-office-subtitle">Department of Education</p>
                    <p className="division-office-description">
                      Monitor personnel coverage, inspect position mix, and move through
                      the registry using faster filters and navigation controls.
                    </p>
                  </div>
                </div>

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
                    onClick={() => setShowMapModal(true)}
                  >
                    NCR Division Map
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

            <section className="dashboard-enrolment-band">
              <div className="dashboard-enrolment-copy">
                <span className="section-kicker">Regional Enrolment View</span>
                <h3>All 16 divisions in one comparison</h3>
                <p>
                  This chart compares the total ALS enrolment across NCR for school year{" "}
                  <strong>{enrolmentData?.schoolYear || "2025-2026"}</strong>. The current division
                  is highlighted so you can compare its enrolment volume against the rest of the region.
                </p>

                <div className="dashboard-enrolment-metrics">
                  <div className="dashboard-enrolment-metric">
                    <span>Selected Division</span>
                    <strong>{selectedCity.division}</strong>
                    <small>
                      {selectedDivisionEnrolment
                        ? `${formatNumber(selectedDivisionEnrolment.grandTotal.total)} learners`
                        : "Waiting for enrolment data"}
                    </small>
                  </div>
                  <div className="dashboard-enrolment-metric">
                    <span>Coverage</span>
                    <strong>{formatNumber(enrolmentData?.divisions?.length || 16)}</strong>
                    <small>NCR divisions included</small>
                  </div>
                </div>
              </div>

              <div className="dashboard-enrolment-visual">
                {regionalEnrolmentChartData ? (
                  <div className="dashboard-enrolment-chart-shell">
                    <Bar data={regionalEnrolmentChartData} options={regionalEnrolmentChartOptions} />
                  </div>
                ) : isDashboardEnrolmentLoading ? (
                  <p className="dashboard-enrolment-state">Loading regional enrolment chart...</p>
                ) : dashboardEnrolmentError ? (
                  <p className="dashboard-enrolment-state dashboard-enrolment-state-error">
                    {dashboardEnrolmentError}
                  </p>
                ) : (
                  <p className="dashboard-enrolment-state">
                    Regional enrolment data is not available yet.
                  </p>
                )}
              </div>
            </section>

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

        <EnrollmentModal
          key={`enrolment-${showEnrolmentModal}-${selectedDivision || "regional-home"}`}
          isOpen={showEnrolmentModal}
          onClose={() => setShowEnrolmentModal(false)}
          onHomeClick={() => {
            setShowEnrolmentModal(false);
            resetToHome();
          }}
          enrolmentData={enrolmentData}
          isLoading={isEnrolmentLoading}
          error={enrolmentError}
          currentDivision={selectedDivision}
        />

        <NCRMapModal
          key={`map-${showMapModal}-${selectedDivision || "regional-home"}`}
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          divisions={allData}
          currentDivision={selectedDivision}
          onSelectDivision={handleCityChange}
          onHomeClick={() => {
            setShowMapModal(false);
            resetToHome();
          }}
        />
      </main>
    </div>
  );
};

export default Dashboard;
