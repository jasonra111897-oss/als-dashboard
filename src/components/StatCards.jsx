import React from "react";
import { formatNumber } from "../utils/formatters";
import "./StatCards.css";

const StatCards = ({ cityData, divisionEnrolment, divisionInsights }) => {
  if (!cityData) return null;

  const cards = [
    {
      title: "Total Schools",
      value: formatNumber(cityData.totalSchools || 0),
      subtext: "Registered centers",
      accentClass: "border-blue",
      trend: `${formatNumber(cityData.totalImplementers || 0)} implementers assigned`,
    },
    {
      title: "Total Implementers",
      value: formatNumber(cityData.totalImplementers || 0),
      subtext: "Active personnel",
      accentClass: "border-green",
      trend: `${formatNumber(divisionInsights?.averageEnrolleesPerTeacher || 0)} learners per teacher`,
    },
    {
      title: "Division Enrolment",
      value: formatNumber(divisionEnrolment?.grandTotal?.total || 0),
      subtext: "School year 2025-2026",
      accentClass: "border-orange",
      trend: divisionInsights?.rankLabel || "Waiting for regional rank",
    },
    {
      title: "Current Focus",
      value: formatNumber(cityData.activeDivisions || 0),
      subtext: "Selected division view",
      accentClass: "border-platinum",
      trend: divisionInsights?.leadingRole || "ALS implementers",
    },
  ];

  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <div key={card.title} className={`stat-card ${card.accentClass}`}>
          <div className="stat-card-content">
            <h3 className="stat-title">{card.title}</h3>
            <p className="stat-number">{card.value}</p>
            <span className="stat-subtext">{card.subtext}</span>
          </div>
          <span className="stat-trend">{card.trend}</span>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
