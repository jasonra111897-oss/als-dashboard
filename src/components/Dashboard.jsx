import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [isDashboardEnrolmentLoading, setIsDashboardEnrolmentLoading] = useState(false);
  const [dashboardEnrolmentError, setDashboardEnrolmentError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const regionalChartRef = useRef(null);

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
        setIsLoading(true);
        setDashboardError("");
        const data = await loadDashboard();

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

    hydrateDashboard();

    return () => {
      ignore = true;
    };
  }, [loadDashboard]);

  const handleDataSourcesUpdated = useCallback(async () => {
    try {
      setIsLoading(true);
      setDashboardError("");
      setEnrolmentData(null);
      setSchoolsData(null);
      setDashboardEnrolmentError("");
      setEnrolmentError("");
      setSchoolsError("");
      const data = await loadDashboard();
      setAllData(data);
    } catch (err) {
      setDashboardError(err.message || "Unable to refresh dashboard data after workbook upload.");
    } finally {
      setIsLoading(false);
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
  const averageLoad = selectedCity
    ? Math.max(
        1,
        Math.round(selectedCity.totalImplementers / Math.max(selectedCity.totalSchools, 1))
      )
    : 0;

  const regionalEnrolmentEntries = useMemo(() => enrolmentData?.divisions || [], [enrolmentData]);
  const regionalEnrolmentTotals = useMemo(() => {
    if (!regionalEnrolmentEntries.length) {
      return [];
    }

    return [...regionalEnrolmentEntries].sort(
      (left, right) => right.grandTotal.total - left.grandTotal.total
    );
  }, [regionalEnrolmentEntries]);

  const regionalHighestEnrolment = regionalEnrolmentTotals[0] || null;
  const regionalLowestEnrolment =
    regionalEnrolmentTotals.length > 0 ? regionalEnrolmentTotals[regionalEnrolmentTotals.length - 1] : null;
  const regionalAverageEnrolment = regionalEnrolmentEntries.length
    ? Math.round(
        regionalEnrolmentEntries.reduce((sum, division) => sum + division.grandTotal.total, 0) /
          regionalEnrolmentEntries.length
      )
    : 0;

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
    const selectedRankIndex = regionalEnrolmentTotals.findIndex(
      (division) => division.division === selectedCity.division
    );

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
      rankLabel:
        selectedRankIndex >= 0
          ? `Rank #${selectedRankIndex + 1} by enrolment in NCR`
          : "Regional rank unavailable",
      regionalGap:
        selectedDivisionEnrolment && regionalAverageEnrolment
          ? selectedDivisionEnrolment.grandTotal.total - regionalAverageEnrolment
          : 0,
    };
  }, [
    leadingRole,
    regionalAverageEnrolment,
    regionalEnrolmentTotals,
    selectedCity,
    selectedDivisionEnrolment,
    topRoles,
  ]);

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
            afterLabel: (context) =>
              regionalEnrolmentEntries[context.dataIndex]?.division === selectedDivision
                ? "Currently selected division"
                : "Click to open this division",
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
    [regionalEnrolmentEntries, selectedDivision]
  );

  const handleRegionalChartClick = (event) => {
    const chart = regionalChartRef.current;
    if (!chart || !regionalEnrolmentEntries.length) {
      return;
    }

    const points = chart.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      true
    );

    if (!points.length) {
      return;
    }

    const clickedDivision = regionalEnrolmentEntries[points[0].index];
    if (clickedDivision?.division) {
      handleCityChange(clickedDivision.division);
    }
  };

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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="dashboard-state-card">
          <span className="section-kicker">Initializing Dashboard</span>
          <h2>Loading ALS NCR Dashboard...</h2>
          <p>Preparing the latest regional personnel, enrolment, and division data.</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
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

      <main className={`dashboard-content ${showClcshaDataPage ? "dashboard-content-wide" : ""}`.trim()}>
        {showClcshaDataPage ? (
          <ClcshaDataPage onSourcesUpdated={handleDataSourcesUpdated} />
        ) : showAboutAlsModal ? (
          <AboutALSModal
            isOpen={showAboutAlsModal}
            onClose={() => setShowAboutAlsModal(false)}
            allData={allData}
            enrolmentData={enrolmentData}
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
            onSelectDivision={handleCityChange}
            onHomeClick={resetToHome}
            inlineMode
          />
        ) : showShsMapModal ? (
          <ALSShsMapModal
            key={`shs-map-inline-${selectedDivision || "regional-home"}`}
            isOpen={showShsMapModal}
            onClose={() => setShowShsMapModal(false)}
            onHomeClick={resetToHome}
            currentDivision={selectedDivision}
            divisions={allData}
            schoolsData={schoolsData}
            isLoading={isSchoolsLoading}
            error={schoolsError}
            onSelectDivision={handleCityChange}
            inlineMode
          />
        ) : selectedCity ? (
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
                    onClick={handleOpenShsMap}
                  >
                    ALS Schools Map
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

            <section className="executive-summary-band">
              <div className="executive-summary-copy">
                <span className="section-kicker">Executive Summary</span>
                <h3>Regional command view for {selectedCity.division}</h3>
                <p>
                  Compare the selected division against NCR-wide enrolment performance, surface
                  the strongest personnel signal, and move directly into the busiest divisions.
                </p>
              </div>

              <div className="executive-summary-grid">
                <div className="executive-summary-card">
                  <span>Total NCR Enrollees</span>
                  <strong>{formatNumber(enrolmentData?.totals?.grandTotal?.total || 0)}</strong>
                  <small>Across all NCR divisions</small>
                </div>
                <div className="executive-summary-card">
                  <span>Highest Enrolment</span>
                  <strong>{regionalHighestEnrolment?.division || "Waiting for data"}</strong>
                  <small>
                    {regionalHighestEnrolment
                      ? `${formatNumber(regionalHighestEnrolment.grandTotal.total)} learners`
                      : "Regional data loading"}
                  </small>
                </div>
                <div className="executive-summary-card">
                  <span>Lowest Enrolment</span>
                  <strong>{regionalLowestEnrolment?.division || "Waiting for data"}</strong>
                  <small>
                    {regionalLowestEnrolment
                      ? `${formatNumber(regionalLowestEnrolment.grandTotal.total)} learners`
                      : "Regional data loading"}
                  </small>
                </div>
                <div className="executive-summary-card">
                  <span>Division Standing</span>
                  <strong>{divisionTeacherInsights?.rankLabel || "Ranking soon"}</strong>
                  <small>
                    {divisionTeacherInsights
                      ? `${divisionTeacherInsights.regionalGap >= 0 ? "+" : ""}${formatNumber(
                          divisionTeacherInsights.regionalGap
                        )} vs NCR average`
                      : "Awaiting enrolment comparison"}
                  </small>
                </div>
              </div>
            </section>

            <StatCards
              cityData={selectedCity}
              divisionEnrolment={selectedDivisionEnrolment}
              divisionInsights={divisionTeacherInsights}
            />

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
                  <div className="dashboard-enrolment-metric">
                    <span>Average Division Load</span>
                    <strong>{formatNumber(regionalAverageEnrolment)}</strong>
                    <small>Regional average enrolment</small>
                  </div>
                  <div className="dashboard-enrolment-metric">
                    <span>Top Role Signal</span>
                    <strong>{divisionTeacherInsights?.leadingRole || "Awaiting data"}</strong>
                    <small>
                      {divisionTeacherInsights
                        ? `${formatNumber(divisionTeacherInsights.selectedRoleCount)} personnel in leading role`
                        : "Role distribution will appear here"}
                    </small>
                  </div>
                </div>

                <div className="dashboard-leaderboard-card">
                  <div className="dashboard-leaderboard-header">
                    <span className="section-kicker">Regional Leaderboard</span>
                    <p>Click a bar or a row to jump divisions.</p>
                  </div>
                  <div className="dashboard-leaderboard-list">
                    {regionalEnrolmentTotals.slice(0, 5).map((division, index) => (
                      <button
                        key={division.division}
                        type="button"
                        className={`dashboard-leaderboard-item ${
                          division.division === selectedDivision ? "active" : ""
                        }`}
                        onClick={() => handleCityChange(division.division)}
                      >
                        <span className="dashboard-leaderboard-rank">#{index + 1}</span>
                        <span className="dashboard-leaderboard-division">{division.division}</span>
                        <strong>{formatNumber(division.grandTotal.total)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dashboard-enrolment-visual">
                {regionalEnrolmentChartData ? (
                  <div className="dashboard-enrolment-chart-shell">
                    <Bar
                      ref={regionalChartRef}
                      data={regionalEnrolmentChartData}
                      options={regionalEnrolmentChartOptions}
                      onClick={handleRegionalChartClick}
                    />
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

            <section className="division-insight-ribbon">
              <div className="division-insight-card">
                <span>Average Learners Per Teacher</span>
                <strong>{formatNumber(divisionTeacherInsights?.averageEnrolleesPerTeacher || 0)}</strong>
                <small>Current enrollee load across the division roster</small>
              </div>
              <div className="division-insight-card">
                <span>Highest Teacher Load</span>
                <strong>{formatNumber(divisionTeacherInsights?.highestTeacherLoad || 0)}</strong>
                <small>Largest current learner count handled by one teacher</small>
              </div>
              <div className="division-insight-card">
                <span>Newest Service Record</span>
                <strong>{divisionTeacherInsights?.newestTeacherLabel || "No data yet"}</strong>
                <small>Most recent ALS teacher service date captured in the workbook</small>
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
          </>
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
