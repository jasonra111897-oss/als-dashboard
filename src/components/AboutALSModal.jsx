import React, { useEffect, useMemo } from "react";
import {
  ABOUT_ALS_BENEFICIARIES,
  ABOUT_ALS_DELIVERY_POINTS,
  ABOUT_ALS_PROGRAMS,
} from "../constants/aboutAls";
import { formatNumber } from "../utils/formatters";
import "./AboutALSModal.css";

const AboutALSModal = ({ isOpen, onClose, allData, enrolmentData, inlineMode = false }) => {
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

  const regionalMetrics = useMemo(() => {
    const divisions = Array.isArray(allData) ? allData.length : 0;
    const schools = Array.isArray(allData)
      ? allData.reduce((sum, division) => sum + Number(division.totalSchools || 0), 0)
      : 0;
    const personnel = Array.isArray(allData)
      ? allData.reduce((sum, division) => sum + Number(division.totalImplementers || 0), 0)
      : 0;
    const enrollees = enrolmentData?.totals?.grandTotal?.total || 0;

    return { divisions, schools, personnel, enrollees };
  }, [allData, enrolmentData]);

  if (!isOpen) {
    return null;
  }

  const content = (
    <div
      className={`about-als-modal ${inlineMode ? "about-als-modal-inline" : ""}`}
      onClick={(event) => event.stopPropagation()}
      id="about-als-top"
    >
      <div className="modal-header about-als-header">
        <div className="about-als-header-copy">
          <span className="section-kicker">Regional Information</span>
          <h2>About ALS</h2>
          <p>
            A quick NCR-focused guide to the Alternative Learning System, its programs, target
            learners, and the regional footprint currently tracked in this dashboard.
          </p>
        </div>

        <div className="about-als-header-actions" />
      </div>

      <section className="about-als-hero" id="about-als-overview">
        <div className="about-als-hero-copy">
          <span className="section-kicker">Alternative Learning System</span>
          <h3>Flexible education access for learners across the National Capital Region</h3>
          <p>
            ALS provides alternative and inclusive learning opportunities for Filipinos who need
            a flexible path to basic education. In NCR, the system depends on coordinated
            regional planning, division implementation, and school-site access.
          </p>
        </div>

        <div className="about-als-hero-grid">
          <div className="about-als-metric-card">
            <span>Tracked Divisions</span>
            <strong>{formatNumber(regionalMetrics.divisions)}</strong>
            <small>NCR divisions covered in the dashboard</small>
          </div>
          <div className="about-als-metric-card">
            <span>School Sites</span>
            <strong>{formatNumber(regionalMetrics.schools)}</strong>
            <small>Mapped ALS school coverage in the workbook</small>
          </div>
          <div className="about-als-metric-card">
            <span>ALS Personnel</span>
            <strong>{formatNumber(regionalMetrics.personnel)}</strong>
            <small>Regional implementers currently tracked</small>
          </div>
          <div className="about-als-metric-card">
            <span>Enrolment Footprint</span>
            <strong>{formatNumber(regionalMetrics.enrollees)}</strong>
            <small>Latest NCR enrolment total in the dashboard</small>
          </div>
        </div>
      </section>

      <div className="about-als-grid">
        <section className="about-als-panel">
          <div className="about-als-panel-header">
            <span className="section-kicker">Mission and Purpose</span>
            <h3>What ALS supports in NCR</h3>
          </div>
          <p>
            The dashboard supports regional and division teams by consolidating personnel,
            enrolment, school-site, and map access into one workspace. It helps teams understand
            where services exist, who is implementing them, and how divisions compare across the
            region.
          </p>
          <ul className="about-als-list">
            <li>Strengthens visibility across all tracked NCR divisions</li>
            <li>Supports flexible learning delivery and regional coordination</li>
            <li>Connects school sites, personnel records, maps, and enrolment views</li>
          </ul>
        </section>

        <section className="about-als-panel" id="about-als-programs">
          <div className="about-als-panel-header">
            <span className="section-kicker">Core Programs</span>
            <h3>Major ALS program areas</h3>
          </div>
          <div className="about-als-program-grid">
            {ABOUT_ALS_PROGRAMS.map((program) => (
              <article key={program.title} className="about-als-program-card">
                <strong>{program.title}</strong>
                <p>{program.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-als-panel" id="about-als-learners">
          <div className="about-als-panel-header">
            <span className="section-kicker">Who ALS Serves</span>
            <h3>Priority learner groups</h3>
          </div>
          <ul className="about-als-list">
            {ABOUT_ALS_BENEFICIARIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="about-als-panel" id="about-als-delivery">
          <div className="about-als-panel-header">
            <span className="section-kicker">Regional Delivery</span>
            <h3>How this dashboard supports implementation</h3>
          </div>
          <ul className="about-als-list">
            {ABOUT_ALS_DELIVERY_POINTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );

  if (inlineMode) {
    return content;
  }

  return <div className="modal-overlay" onClick={onClose}>{content}</div>;
};

export default AboutALSModal;
