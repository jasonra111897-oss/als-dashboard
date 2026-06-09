import React, { useEffect, useMemo, useState } from "react";
import { formatNumber } from "../utils/formatters";
import "./EnrollmentModal.css";

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

const CHART_PROGRAM_ROWS = PROGRAM_ROWS.filter((program) => program.key !== "grandTotal");

const EnrollmentModal = ({
  isOpen,
  onClose,
  enrolmentData,
  isLoading,
  error,
  currentDivision,
  inlineMode = false,
}) => {
  const [selectedDivisionName, setSelectedDivisionName] = useState(currentDivision || "");

  useEffect(() => {
    if (!isOpen || inlineMode) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [inlineMode, isOpen]);

  const selectedDivision =
    enrolmentData?.divisions?.find(
      (division) => division.division === (selectedDivisionName || currentDivision)
    ) ||
    enrolmentData?.divisions?.[0] ||
    null;

  const selectedProgramCards = useMemo(
    () =>
      selectedDivision
        ? CHART_PROGRAM_ROWS.map((program) => ({
            ...program,
            values: selectedDivision[program.key],
          }))
        : [],
    [selectedDivision]
  );

  const maxProgramTotal = useMemo(
    () => Math.max(...selectedProgramCards.map((item) => item.values.total), 1),
    [selectedProgramCards]
  );

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    const loadingContent = (
      <div
        className={`enrolment-modal enrolment-modal-state ${
          inlineMode ? "enrolment-modal-inline" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header enrolment-modal-header">
          <h2>ALS Enrolment 2025-2026</h2>
        </div>
        <p className="enrolment-state-text">Loading enrolment data...</p>
      </div>
    );

    if (inlineMode) {
      return loadingContent;
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        {loadingContent}
      </div>
    );
  }

  if (error) {
    const errorContent = (
      <div
        className={`enrolment-modal enrolment-modal-state ${
          inlineMode ? "enrolment-modal-inline" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header enrolment-modal-header">
          <h2>ALS Enrolment 2025-2026</h2>
        </div>
        <p className="enrolment-state-text enrolment-state-error">{error}</p>
      </div>
    );

    if (inlineMode) {
      return errorContent;
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        {errorContent}
      </div>
    );
  }

  if (!enrolmentData || !selectedDivision) {
    return null;
  }

  const content = (
      <div
        className={`enrolment-modal enrolment-page ${inlineMode ? "enrolment-modal-inline" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <section className="enrolment-hero">
          <div className="enrolment-hero-copy">
            <span className="section-kicker section-kicker-light">NCR ALS</span>
            <h2>ALS Enrolment {enrolmentData.schoolYear}</h2>
          </div>
        </section>

        <section className="enrolment-focus-grid" aria-label="Enrolment dashboard">
          <div className="enrolment-focus-panel">
            <div className="enrolment-division-select-shell">
              <label htmlFor="enrolment-division-select">Choose Division</label>
              <select
                id="enrolment-division-select"
                className="enrolment-division-select"
                value={selectedDivision.division}
                onChange={(event) => setSelectedDivisionName(event.target.value)}
              >
                {enrolmentData.divisions.map((division) => (
                  <option key={division.division} value={division.division}>
                    {division.division}
                  </option>
                ))}
              </select>
            </div>

            <div className="enrolment-selected-heading">
              <h3>{selectedDivision.division}</h3>
              <strong>{formatNumber(selectedDivision.grandTotal.total)}</strong>
              <span>Total learners</span>
            </div>

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
            <div className="enrolment-chart-heading">
              <span className="section-kicker">Program Breakdown</span>
              <h3>{selectedDivision.division}</h3>
            </div>
            <div className="enrolment-chart-shell">
              <div className="enrolment-breakdown-table">
                <div className="enrolment-breakdown-head" aria-hidden="true">
                  <span>Program</span>
                  <span>Male</span>
                  <span>Female</span>
                  <span>Total</span>
                </div>

                {selectedProgramCards.map((item) => {
                  const total = item.values.total || 0;
                  const male = item.values.male || 0;
                  const female = item.values.female || 0;
                  const totalPercent = Math.max((total / maxProgramTotal) * 100, total ? 10 : 0);

                  return (
                    <div key={item.key} className="enrolment-breakdown-row">
                      <div className="enrolment-breakdown-label">
                        <strong>{item.shortLabel}</strong>
                        <span>{item.label}</span>
                      </div>
                      <strong className="enrolment-breakdown-number">{formatNumber(male)}</strong>
                      <strong className="enrolment-breakdown-number">{formatNumber(female)}</strong>
                      <strong className="enrolment-breakdown-number enrolment-breakdown-number-total">
                        {formatNumber(total)}
                      </strong>
                      <div className="enrolment-breakdown-meter" aria-hidden="true">
                        <span style={{ width: `${totalPercent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="enrolment-table-shell">
          <table className="enrolment-table">
            <colgroup>
              <col className="enrolment-col-division" />
              {Array.from({ length: 15 }).map((_, index) => (
                <col key={`enrolment-col-${index}`} className="enrolment-col-metric" />
              ))}
            </colgroup>
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
  );

  if (inlineMode) {
    return content;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
};

export default EnrollmentModal;
