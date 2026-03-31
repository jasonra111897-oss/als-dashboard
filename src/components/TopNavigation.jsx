import React from 'react';

const TopNavigation = ({ divisions, onCitySelect }) => {
  return (
    <header style={styles.headerWrapper}>
      {/* 1. Top Mini Nav (Optional/Text only) */}
      <div style={styles.miniNav}>
        <span>ALSPH</span>
        <span>Home</span>
        <span>About Us</span>
        <span>Resources</span>
        <span>Contact Us</span>
      </div>

      {/* 2. Main Blue Branding Bar */}
      <div style={styles.blueBar}>
        <div style={styles.logoGroup}>
          <img src="/deped-ncr-logo.png" alt="DepEd" style={styles.mainLogo} />
          <div style={styles.brandText}>
            <p style={styles.topText}>REPUBLIC OF THE PHILIPPINES</p>
            <h1 style={styles.middleText}>DEPARTMENT OF EDUCATION</h1>
            <p style={styles.bottomText}>NATIONAL CAPITAL REGION (NCR)</p>
          </div>
        </div>
        <img src="/als-logo.png" alt="ALS" style={styles.sideLogo} />
      </div>

      {/* 3. Breadcrumb & Selector Bar */}
      <div style={styles.whiteBar}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbText}>YOU ARE HERE: </span>
          <span style={styles.breadcrumbActive}>NCR DASHBOARD</span>
        </div>
        <div style={styles.selectorArea}>
          <span style={styles.viewLabel}>VIEW DIVISION:</span>
          <select 
            onChange={(e) => onCitySelect(e.target.value)}
            style={styles.dropdown}
          >
            <option value="">-- Select City --</option>
            {divisions.map((div, index) => (
              <option key={index} value={div.Division}>
                {div.Division}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Yellow Accent Border */}
      <div style={styles.yellowAccent}></div>
    </header>
  );
};

const styles = {
  headerWrapper: { width: '100%', fontFamily: 'Arial, sans-serif' },
  miniNav: { display: 'flex', justifyContent: 'space-around', padding: '5px 15%', fontSize: '10px', color: '#64748b', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' },
  blueBar: { backgroundColor: '#0038a8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 5%' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '20px' },
  mainLogo: { height: '70px' },
  sideLogo: { height: '60px', backgroundColor: '#fff', padding: '5px', borderRadius: '4px' },
  brandText: { textAlign: 'left' },
  topText: { fontSize: '12px', margin: 0, letterSpacing: '1px' },
  middleText: { fontSize: '24px', fontWeight: 'bold', margin: '2px 0' },
  bottomText: { fontSize: '12px', margin: 0, opacity: 0.8 },
  whiteBar: { backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 5%', fontSize: '12px' },
  breadcrumbText: { color: '#94a3b8' },
  breadcrumbActive: { color: '#64748b', fontWeight: 'bold' },
  viewLabel: { color: '#0038a8', fontWeight: 'bold', marginRight: '10px' },
  dropdown: { border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 10px', fontWeight: 'bold', color: '#1e293b' },
  yellowAccent: { height: '5px', backgroundColor: '#facc15', width: '100%' }
};

export default TopNavigation;