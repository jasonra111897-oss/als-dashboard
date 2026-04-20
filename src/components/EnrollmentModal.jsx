import React from "react";

const formatNumber = (value) => Number(value || 0).toLocaleString();

const EnrollmentModal = ({ isOpen, onClose, enrolmentData, isLoading, error }) => {
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

  if (!enrolmentData) {
    return null;
  }

  const totalRows = [
    {
      label: "Basic Literacy Program",
      value: enrolmentData.totals.basicLiteracyProgram.total,
    },
    {
      label: "A&E Elementary",
      value: enrolmentData.totals.aeElementary.total,
    },
    {
      label: "A&E Junior High School",
      value: enrolmentData.totals.aeJuniorHighSchool.total,
    },
    {
      label: "Grand Total",
      value: enrolmentData.totals.grandTotal.total,
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="enrolment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header enrolment-modal-header">
          <div>
            <h2>ALS Enrolment {enrolmentData.schoolYear}</h2>
            <p className="enrolment-subtitle">
              Consolidated NCR enrolment from the workbook&apos;s <code>enrolment</code> sheet.
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="enrolment-summary-grid">
          {totalRows.map((item) => (
            <div key={item.label} className="enrolment-summary-card">
              <span>{item.label}</span>
              <strong>{formatNumber(item.value)}</strong>
            </div>
          ))}
        </div>

        <div className="enrolment-table-shell">
          <table className="enrolment-table">
            <thead>
              <tr>
                <th>Division</th>
                <th>BLP</th>
                <th>A&amp;E Elem</th>
                <th>A&amp;E JHS</th>
                <th>BP-OSA</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {enrolmentData.divisions.map((division) => (
                <tr key={division.division}>
                  <td>{division.division}</td>
                  <td>{formatNumber(division.basicLiteracyProgram.total)}</td>
                  <td>{formatNumber(division.aeElementary.total)}</td>
                  <td>{formatNumber(division.aeJuniorHighSchool.total)}</td>
                  <td>{formatNumber(division.bpOsaMandaluyong.total)}</td>
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
