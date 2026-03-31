const StatCards = ({ cityData }) => {
  if (!cityData) return null;

  return (
    <div style={styles.grid}>
      {/* Card 1: Total Schools */}
      <div style={styles.cardBlue}>
        <h3>TOTAL SCHOOLS</h3>
        <p style={styles.number}>16</p> 
        <span>Registered Centers</span>
      </div>

      {/* Card 2: Total Implementers (Pulled from Excel count) */}
      <div style={styles.cardGreen}>
        <h3>TOTAL IMPLEMENTERS</h3>
        <p style={styles.number}>{cityData["Total Implementers"] || 0}</p>
        <span>Active Personnel</span>
      </div>

      {/* Card 3: Active Divisions */}
      <div style={styles.cardYellow}>
        <h3>ACTIVE DIVISIONS</h3>
        <p style={styles.number}>16</p>
        <span>NCR Districts</span>
      </div>
    </div>
  );
};