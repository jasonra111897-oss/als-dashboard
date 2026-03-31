import React from 'react';

const StatCards = ({ cityData }) => {
  return (
    <div style={styles.grid}>
      {/* Card 1: Total Schools */}
      <div style={{ ...styles.card, borderTop: "5px solid #3b82f6" }}>
        <h3 style={styles.cardTitle}>TOTAL SCHOOLS</h3>
        <p style={styles.number}>16</p>
        <span style={styles.subText}>Registered Centers</span>
      </div>

      {/* Card 2: Total Implementers (Pulled from your Excel count) */}
      <div style={{ ...styles.card, borderTop: "5px solid #10b981" }}>
        <h3 style={styles.cardTitle}>TOTAL IMPLEMENTERS</h3>
        <p style={styles.number}>{cityData["Total Implementers"] || 0}</p>
        <span style={styles.subText}>Active Personnel</span>
      </div>

      {/* Card 3: Active Divisions */}
      <div style={{ ...styles.card, borderTop: "5px solid #f59e0b" }}>
        <h3 style={styles.cardTitle}>ACTIVE DIVISIONS</h3>
        <p style={styles.number}>16</p>
        <span style={styles.subText}>NCR Districts</span>
      </div>
    </div>
  );
};

const styles = {
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(3, 1fr)", 
    gap: "25px" 
  },
  card: { 
    backgroundColor: "#ffffff", 
    padding: "35px 20px", 
    borderRadius: "16px", 
    textAlign: "center", 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" 
  },
  cardTitle: { 
    color: "#64748b", 
    fontSize: "13px", 
    fontWeight: "bold", 
    letterSpacing: "0.05em",
    marginBottom: "20px" 
  },
  number: { 
    fontSize: "56px", 
    fontWeight: "800", 
    color: "#1e293b", 
    margin: "10px 0" 
  },
  subText: { 
    color: "#94a3b8", 
    fontSize: "12px" 
  }
};

export default StatCards;