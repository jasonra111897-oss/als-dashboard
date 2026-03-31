import React from 'react';

const StatCards = ({ cityData }) => {
  // Helper to safely get the numbers we calculated in Step 1
  const getVal = (key) => cityData[key] || 0;

  return (
    <div style={styles.grid}>
      <div style={styles.card}>
        <h3>Teacher I</h3>
        <p style={styles.number}>{getVal("Teacher I")}</p>
        <span>Active Personnel</span>
      </div>
      <div style={styles.card}>
        <h3>Teacher II</h3>
        <p style={styles.number}>{getVal("Teacher II")}</p>
        <span>Active Personnel</span>
      </div>
      <div style={styles.card}>
        <h3>Teacher III</h3>
        <p style={styles.number}>{getVal("Teacher III")}</p>
        <span>Active Personnel</span>
      </div>
    </div>
  );
};

// YOU MUST INCLUDE THIS BLOCK OR IT WILL CRASH
const styles = {
  grid: { display: "flex", gap: "20px", marginBottom: "30px" },
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", flex: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  number: { fontSize: "32px", fontWeight: "bold", margin: "10px 0" }
};

export default StatCards;