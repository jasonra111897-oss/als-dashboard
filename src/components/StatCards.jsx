import React from 'react';

const StatCards = ({ type, cityData }) => {
  const isAE = type === "AE";

  // --- THE BULLETPROOF FIX: DATA FINDER HELPER ---
  // This looks for an Excel column that CONTAINS your word
  const findData = (searchTerm) => {
    if (!cityData) return 0;
    
    // Get all column names from the current Excel row
    const keys = Object.keys(cityData);
    
    // Find the first key that includes our search term (e.g., 'Passer')
    const match = keys.find(k => 
      k.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return cityData[match] || 0;
  };

  return (
    <div style={styles.grid}>
      {/* CARD 1: Passers or CLCs */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {isAE ? "A&E Passers" : "Learning Centers"}
        </h3>
        <p style={styles.number}>
          {isAE ? findData("Passer") : findData("CLC")}
        </p>
        <span style={styles.subText}>
          {isAE ? "Completion Rate" : "Registered CLCs"}
        </span>
      </div>

      {/* CARD 2: Learners or Teachers */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {isAE ? "Total Learners" : "Mobile Teachers"}
        </h3>
        <p style={styles.number}>
          {isAE ? findData("Learner") : findData("Teacher")}
        </p>
        <span style={styles.subText}>
          {isAE ? "Elementary & Secondary" : "Field Personnel"}
        </span>
      </div>

      {/* CARD 3: Contextual Info (Optional) */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {isAE ? "Enrolled" : "DALSCs"}
        </h3>
        <p style={styles.number}>
          {isAE ? findData("Enrol") : findData("DALSC")}
        </p>
        <span style={styles.subText}>
          {isAE ? "Current Academic Year" : "District Coordinators"}
        </span>
      </div>
    </div>
  );
};

// --- STUNNING & PROFESSIONAL STYLES ---
const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    marginBottom: "35px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    borderLeft: "6px solid #3b82f6", // DepEd Blue accent
    transition: "transform 0.2s ease",
  },
  cardTitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0 0 10px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  number: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "10px 0",
    color: "#1e293b", // Professional Dark Slate
  },
  subText: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default StatCards;