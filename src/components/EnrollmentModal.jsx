import React, { useMemo, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatNumber = (value) => Number(value || 0).toLocaleString();

const PROGRAM_ROWS = [
  {
    key: "basicLiteracyProgram",
    label: "Basic Literacy Program",
    shortLabel: "BLP",
  },
  {
    key: "aeElementary",
    label: "A&E Elementary",
    shortLabel: "A&E Elem",
  },
  {
    key: "aeJuniorHighSchool",
    label: "A&E Junior High School",
    shortLabel: "A&E JHS",
  },
  {
    key: "bpOsaMandaluyong",
    label: "BP-OSA",
    shortLabel: "BP-OSA",
  },
  {
    key: "grandTotal",
    label: "Grand Total",
    shortLabel: "Grand Total",
  },
];

const EnrollmentModal = ({
  isOpen,
  onClose,
  onHomeClick,
  enrolmentData,
  isLoading,
  error,
  currentDivision,
}) => {
  const [selectedDivisionName, setSelectedDivisionName] = useState(currentDivision || "");

  const selectedDivision =
    enrolmentData?.divisions?.find(
      (division) => division.division === (selectedDivisionName || currentDivision)
    ) ||
    enrolmentData?.divisions?.[0] ||
    null;

  const selectedProgramCards = selectedDivision
    ? PROGRAM_ROWS.map((program) => ({
        ...program,
        values: selectedDivision[program.key],
      }))
    : [];

  const chartData = useMemo(() => {
    if (!selectedDivision) {
      return null;
    }

    return {
      labels: PROGRAM_ROWS.map((program) => program.shortLabel),
      datasets: [
        {
          label: "Male",
          data: PROGRAM_ROWS.map((program) => selectedDivision[program.key].male),
          backgroundColor: "rgba(23, 59, 120, 0.9)",
          borderRadius: 10,
        },
        {
          label: "Female",
          data: PROGRAM_ROWS.map((program) => selectedDivision[program.key].female),
          backgroundColor: "rgba(72, 130, 214, 0.82)",
          borderRadius: 10,
        },
        {
          label: "Total",
          data: PROGRAM_ROWS.map((program) => selectedDivision[program.key].total),
          backgroundColor: "rgba(244, 180, 56, 0.86)",
          borderRadius: 10,
        },
      ],
    };
  }, [selectedDivision]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
          },
        },
        title: {
          display: true,
          text: selectedDivision
            ? `${selectedDivision.division} Enrolment Breakdown`
            : "Division Enrolment Breakdown",
          color: "#10213d",
          font: {
            size: 16,
            weight: "700",
          },
          padding: {
            bottom: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            color: "rgba(15, 23, 42, 0.08)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    }),
    [selectedDivision]
  );

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="enrolment-modal enrolment-modal-state" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header enrolment-modal-header">
            <h2>ALS Enrolment 2025-2026</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <p className="enrolment-state-text">Loading enrolment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="enrolment-modal enrolment-modal-state" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header enrolment-modal-header">
            <h2>ALS Enrolment 2025-2026</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <p className="enrolment-state-text enrolment-state-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!enrolmentData || !selectedDivision || !chartData) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="enrolment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header enrolment-modal-header">
          <div>
            <h2>ALS Enrolment {enrolmentData.schoolYear}</h2>
            <p className="enrolment-subtitle">
              Click any NCR division to inspect its exact male, female, and total enrolment
              figures from the workbook&apos;s <code>enrolment</code> sheet.
            </p>
          </div>
          <div className="enrolment-header-actions">
            <button type="button" className="enrolment-home-button" onClick={onHomeClick}>
              HOME
            </button>
          </div>
        </div>

        <div className="enrolment-division-strip" role="tablist" aria-label="NCR divisions">
          {enrolmentData.divisions.map((division) => (
            <button
              key={division.division}
              type="button"
              className={`enrolment-division-chip ${
                selectedDivision.division === division.division ? "active" : ""
              }`}
              onClick={() => setSelectedDivisionName(division.division)}
            >
              {division.division}
            </button>
          ))}
        </div>

        <section className="enrolment-focus-grid">
          <div className="enrolment-focus-panel">
            <span className="section-kicker">Selected Division</span>
            <h3>{selectedDivision.division}</h3>
            <p>
              Division grand total: <strong>{formatNumber(selectedDivision.grandTotal.total)}</strong>
            </p>

            <div className="enrolment-summary-grid">
              {selectedProgramCards.map((item) => (
                <div key={item.key} className="enrolment-summary-card">
                  <span>{item.label}</span>
                  <strong>{formatNumber(item.values.total)}</strong>
                  <div className="enrolment-summary-breakdown">
                    <small>M {formatNumber(item.values.male)}</small>
                    <small>F {formatNumber(item.values.female)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="enrolment-chart-card">
            <div className="enrolment-chart-shell">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </section>

        <div className="enrolment-table-shell">
          <table className="enrolment-table">
            <thead>
              <tr>
                <th rowSpan="2">Division</th>
                <th colSpan="3">BLP</th>
                <th colSpan="3">A&amp;E Elem</th>
                <th colSpan="3">A&amp;E JHS</th>
                <th colSpan="3">BP-OSA</th>
                <th colSpan="3">Grand Total</th>
              </tr>
              <tr>
                <th>Male</th>
                <th>Female</th>
                <th>Total</th>
                <th>Male</th>
                <th>Female</th>
                <th>Total</th>
                <th>Male</th>
                <th>Female</th>
                <th>Total</th>
                <th>Male</th>
                <th>Female</th>
                <th>Total</th>
                <th>Male</th>
                <th>Female</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {enrolmentData.divisions.map((division) => (
                <tr
                  key={division.division}
                  className={
                    selectedDivision.division === division.division ? "enrolment-row-active" : ""
                  }
                  onClick={() => setSelectedDivisionName(division.division)}
                >
                  <td>{division.division}</td>
                  <td>{formatNumber(division.basicLiteracyProgram.male)}</td>
                  <td>{formatNumber(division.basicLiteracyProgram.female)}</td>
                  <td>{formatNumber(division.basicLiteracyProgram.total)}</td>
                  <td>{formatNumber(division.aeElementary.male)}</td>
                  <td>{formatNumber(division.aeElementary.female)}</td>
                  <td>{formatNumber(division.aeElementary.total)}</td>
                  <td>{formatNumber(division.aeJuniorHighSchool.male)}</td>
                  <td>{formatNumber(division.aeJuniorHighSchool.female)}</td>
                  <td>{formatNumber(division.aeJuniorHighSchool.total)}</td>
                  <td>{formatNumber(division.bpOsaMandaluyong.male)}</td>
                  <td>{formatNumber(division.bpOsaMandaluyong.female)}</td>
                  <td>{formatNumber(division.bpOsaMandaluyong.total)}</td>
                  <td>{formatNumber(division.grandTotal.male)}</td>
                  <td>{formatNumber(division.grandTotal.female)}</td>
                  <td>{formatNumber(division.grandTotal.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
