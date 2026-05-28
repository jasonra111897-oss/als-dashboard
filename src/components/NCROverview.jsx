import React from "react";
import { Building2, GraduationCap, MapPinned, Trophy, UsersRound } from "lucide-react";
import {
  getDivisionBadge,
  getDivisionDisplayName,
  getDivisionLogoClassName,
  getDivisionLogoSrc,
} from "../constants/divisions";
import "./NCROverview.css";

const formatMetric = (value) => Number(value || 0).toLocaleString();

const ORBIT_DOTS = [
  { angle: -18, radius: "var(--orbit-radius-outer)", size: 7, color: "#f4c25f", speed: "44s", direction: "normal" },
  { angle: 18, radius: "var(--orbit-radius-inner)", size: 5, color: "#5aa9ff", speed: "36s", direction: "reverse" },
  { angle: 42, radius: "var(--orbit-radius-outer)", size: 6, color: "#35d07f", speed: "48s", direction: "normal" },
  { angle: 76, radius: "var(--orbit-radius-inner)", size: 4, color: "#ff4f6d", speed: "34s", direction: "reverse" },
  { angle: 118, radius: "var(--orbit-radius-outer)", size: 6, color: "#f4c25f", speed: "46s", direction: "normal" },
  { angle: 148, radius: "var(--orbit-radius-inner)", size: 5, color: "#5aa9ff", speed: "38s", direction: "reverse" },
  { angle: 186, radius: "var(--orbit-radius-outer)", size: 7, color: "#35d07f", speed: "50s", direction: "normal" },
  { angle: 214, radius: "var(--orbit-radius-inner)", size: 4, color: "#f4c25f", speed: "35s", direction: "reverse" },
  { angle: 248, radius: "var(--orbit-radius-outer)", size: 5, color: "#ff4f6d", speed: "42s", direction: "normal" },
  { angle: 282, radius: "var(--orbit-radius-inner)", size: 6, color: "#35d07f", speed: "37s", direction: "reverse" },
  { angle: 314, radius: "var(--orbit-radius-outer)", size: 4, color: "#5aa9ff", speed: "47s", direction: "normal" },
  { angle: 338, radius: "var(--orbit-radius-inner)", size: 5, color: "#f4c25f", speed: "39s", direction: "reverse" },
  { angle: 96, radius: "var(--orbit-radius-core)", size: 4, color: "#5aa9ff", speed: "28s", direction: "normal" },
  { angle: 272, radius: "var(--orbit-radius-core)", size: 4, color: "#35d07f", speed: "31s", direction: "reverse" },
  { angle: 8, radius: "var(--orbit-radius-far)", size: 4, color: "#5aa9ff", speed: "58s", direction: "reverse" },
  { angle: 32, radius: "var(--orbit-radius-far)", size: 5, color: "#f4c25f", speed: "62s", direction: "reverse" },
  { angle: 64, radius: "var(--orbit-radius-mid)", size: 4, color: "#35d07f", speed: "52s", direction: "normal" },
  { angle: 132, radius: "var(--orbit-radius-mid)", size: 5, color: "#ff4f6d", speed: "54s", direction: "normal" },
  { angle: 166, radius: "var(--orbit-radius-far)", size: 4, color: "#f4c25f", speed: "60s", direction: "reverse" },
  { angle: 232, radius: "var(--orbit-radius-mid)", size: 5, color: "#5aa9ff", speed: "56s", direction: "normal" },
  { angle: 300, radius: "var(--orbit-radius-far)", size: 4, color: "#35d07f", speed: "64s", direction: "reverse" },
  { angle: 326, radius: "var(--orbit-radius-mid)", size: 5, color: "#f4c25f", speed: "53s", direction: "normal" },
];

const NCROverview = ({ allData, onSelectDivision }) => {
  const hasData = allData && allData.length > 0;
  const divisionMetrics = (hasData ? allData : []).map((division) => {
    const divisionName = division.division;
    const personnel = Number(division.totalImplementers || 0);
    const schools = Number(division.totalSchools || 0);

    return {
      division: divisionName,
      badge: getDivisionBadge(divisionName),
      displayName: getDivisionDisplayName(divisionName),
      logoSrc: getDivisionLogoSrc(divisionName),
      logoClassName: getDivisionLogoClassName(divisionName),
      personnel,
      schools,
      personnelPerSchool: schools ? personnel / schools : 0,
    };
  });

  const divisionLogos = (hasData ? allData : []).map((division, index, divisions) => {
    const divisionName = division.division;

    return {
      division: divisionName,
      badge: getDivisionBadge(divisionName),
      displayName: getDivisionDisplayName(divisionName),
      logoSrc: getDivisionLogoSrc(divisionName),
      logoClassName: getDivisionLogoClassName(divisionName),
      angle: (360 / Math.max(divisions.length, 1)) * index - 90,
      radius: index % 2 === 0 ? "var(--orbit-radius-outer)" : "var(--orbit-radius-inner)",
    };
  });

  const ncrTotals = {
    schools: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalSchools || 0), 0)
      : 0,
    teachers: hasData
      ? allData.reduce((sum, city) => sum + Number(city.totalImplementers || 0), 0)
      : 0,
  };

  const averagePersonnel = hasData ? Math.round(ncrTotals.teachers / allData.length) : 0;
  const maxPersonnel = Math.max(...divisionMetrics.map((division) => division.personnel), 1);
  const maxSchools = Math.max(...divisionMetrics.map((division) => division.schools), 1);
  const maxPersonnelPerSchool = Math.max(
    ...divisionMetrics.map((division) => division.personnelPerSchool),
    1
  );
  const topPersonnel = [...divisionMetrics]
    .sort((left, right) => right.personnel - left.personnel)
    .slice(0, 5);
  const topSchools = [...divisionMetrics]
    .sort((left, right) => right.schools - left.schools)
    .slice(0, 5);
  const topPersonnelPerSchool = [...divisionMetrics]
    .sort((left, right) => right.personnelPerSchool - left.personnelPerSchool)
    .slice(0, 5);
  const rankingGroups = [
    {
      label: "Personnel",
      metric: "personnel",
      max: maxPersonnel,
      rows: topPersonnel,
      suffix: "",
    },
    {
      label: "Schools",
      metric: "schools",
      max: maxSchools,
      rows: topSchools,
      suffix: "",
    },
    {
      label: "Per School",
      metric: "personnelPerSchool",
      max: maxPersonnelPerSchool,
      rows: topPersonnelPerSchool,
      suffix: "",
    },
  ];

  return (
    <div className="ncr-overview-container">
      <section className="overview-hero">
        <div className="overview-hero-copy">
          <span className="section-kicker section-kicker-light">ALS NCR Operations</span>
          <h1>Alternative Learning System Dashboard</h1>
          <p>
            Monitor NCR division coverage, ALS personnel, schools, enrolment, and workbook records
            in one focused regional view.
          </p>
        </div>

        <div className="division-orbit" aria-label="NCR division shortcuts">
          <span className="division-orbit-ring division-orbit-ring-outer" aria-hidden="true" />
          <span className="division-orbit-ring division-orbit-ring-middle" aria-hidden="true" />
          <span className="division-orbit-ring division-orbit-ring-inner" aria-hidden="true" />
          {ORBIT_DOTS.map((dot, index) => (
            <span
              key={`${dot.angle}-${index}`}
              className="orbit-dot"
              style={{
                "--dot-angle": `${dot.angle}deg`,
                "--dot-end-angle": `${dot.angle + 360}deg`,
                "--dot-reverse-end-angle": `${dot.angle - 360}deg`,
                "--dot-radius": dot.radius,
                "--dot-size": `${dot.size}px`,
                "--dot-color": dot.color,
                "--dot-speed": dot.speed,
              }}
              data-direction={dot.direction}
              aria-hidden="true"
            />
          ))}

          <div className="division-orbit-core">
            <img src="/als.png" alt="ALS NCR" />
          </div>

          {divisionLogos.map((division) => (
            <button
              key={division.division}
              type="button"
              className="division-orbit-item"
              style={{
                "--angle": `${division.angle}deg`,
                "--angle-end": `${division.angle + 360}deg`,
                "--counter-angle": `${-division.angle}deg`,
                "--counter-angle-end": `${-(division.angle + 360)}deg`,
                "--radius": division.radius,
              }}
              onClick={() => onSelectDivision?.(division.division)}
              title={division.displayName}
              aria-label={`Open ${division.displayName}`}
            >
              <span className="division-orbit-content">
                {division.logoSrc ? (
                  <img
                    src={division.logoSrc}
                    alt=""
                    className={division.logoClassName}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>{division.badge}</span>
                )}
                <small>{division.displayName}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="ncr-stats-summary">
        <div className="ncr-stat-item">
          <div className="stat-card-main">
            <MapPinned className="stat-icon" aria-hidden="true" />
            <span>
              <span className="stat-label">Divisions</span>
              <span className="stat-value">{formatMetric(hasData ? allData.length : 0)}</span>
            </span>
          </div>
        </div>

        <div className="ncr-stat-item">
          <div className="stat-card-main">
            <UsersRound className="stat-icon" aria-hidden="true" />
            <span>
              <span className="stat-label">Personnel</span>
              <span className="stat-value">{formatMetric(ncrTotals.teachers)}</span>
            </span>
          </div>
        </div>

        <div className="ncr-stat-item">
          <div className="stat-card-main">
            <Building2 className="stat-icon" aria-hidden="true" />
            <span>
              <span className="stat-label">Schools</span>
              <span className="stat-value">{formatMetric(ncrTotals.schools)}</span>
            </span>
          </div>
        </div>

        <div className="ncr-stat-item">
          <div className="stat-card-main">
            <GraduationCap className="stat-icon" aria-hidden="true" />
            <span>
              <span className="stat-label">Avg Personnel</span>
              <span className="stat-value">{formatMetric(averagePersonnel)}</span>
            </span>
          </div>
        </div>
      </div>

      <section className="ncr-data-insights" aria-label="NCR data insights">
        <div className="ncr-insight-heading">
          <span className="section-kicker">Regional Data</span>
          <h2>ALS NCR Summary</h2>
        </div>

        <div className="ncr-ranking-grid">
          {rankingGroups.map((group) => (
            <div className="ncr-insight-card ncr-ranking-card" key={group.label}>
              <div className="ncr-insight-card-header">
                <Trophy aria-hidden="true" />
                <strong>{group.label}</strong>
              </div>
              <div className="ncr-ranking-list">
                {group.rows.map((division, index) => {
                  const value = Number(division[group.metric] || 0);

                  return (
                    <button
                      key={`${group.label}-${division.division}`}
                      type="button"
                      className="ncr-ranking-row"
                      onClick={() => onSelectDivision?.(division.division)}
                    >
                      <span className="ncr-ranking-index">{index + 1}</span>
                      <span className="ncr-ranking-name">{division.displayName}</span>
                      <span className="ncr-ranking-value">
                        {group.metric === "personnelPerSchool"
                          ? value.toFixed(1)
                          : formatMetric(value)}
                        {group.suffix}
                      </span>
                      <span className="ncr-ranking-bar" aria-hidden="true">
                        <span style={{ width: `${Math.max((value / group.max) * 100, 4)}%` }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="ncr-coverage-card ncr-insight-card">
          <div className="ncr-insight-card-header">
            <MapPinned aria-hidden="true" />
            <strong>Division Coverage</strong>
          </div>
          <div className="ncr-coverage-grid">
            {divisionMetrics.map((division) => (
              <button
                key={`coverage-${division.division}`}
                type="button"
                className="ncr-coverage-item"
                onClick={() => onSelectDivision?.(division.division)}
              >
                <span className="ncr-coverage-logo">
                  {division.logoSrc ? (
                    <img
                      src={division.logoSrc}
                      alt=""
                      className={division.logoClassName}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    division.badge
                  )}
                </span>
                <span className="ncr-coverage-name">{division.displayName}</span>
                <span className="ncr-coverage-metrics">
                  <strong>{formatMetric(division.personnel)}</strong>
                  <small>personnel</small>
                  <strong>{formatMetric(division.schools)}</strong>
                  <small>schools</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NCROverview;
