import React from "react";

const TopNavigation = ({ divisions, onCitySelect }) => {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <span style={styles.divider}>|</span>
          <h1 style={styles.title}>ALS NCR DASHBOARD</h1>
        </div>

        <div style={styles.navActions}>
          <label htmlFor="division-select" style={styles.label}>
            VIEW DIVISION:
          </label>
          <select
            id="division-select"
            onChange={(e) => onCitySelect(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Select City --</option>
            {/* Defensive check: only map if divisions exists */}
            {divisions && divisions.map((item, index) => (
              <option key={index} value={item.Division || item.name}>
                {item.Division || item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={styles.yellowBar}></div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#fff",
    paddingTop: "20px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px 15px 20px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  divider: {
    color: "#0038a8",
    fontSize: "24px",
    fontWeight: "bold",
  },
  title: {
    fontSize: "18px",
    color: "#0038a8",
    fontWeight: "bold",
    margin: 0,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  label: {
    fontSize: "14px",
    color: "#0038a8",
    fontWeight: "bold",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontWeight: "bold",
    minWidth: "200px",
    cursor: "pointer",
  },
  yellowBar: {
    height: "4px",
    backgroundColor: "#ffcd00",
    width: "100%",
  },
};

export default TopNavigation;