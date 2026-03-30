import React, { useState, useEffect } from "react";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import LearningStrandsChart from "./LearningStrandsChart";
import PersonnelChart from "./PersonnelChart";

const Dashboard = () => {
  const [view, setView] = useState("AE");
  const [allData, setAllData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState(null);

  // 1. Fetch data from the Backend Server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) throw new Error("Failed to fetch data from server");
        const data = await response.json();
        
        // Log headers to console for debugging purposes
        console.log("Excel Headers Detected:", Object.keys(data[0]));
        
        setAllData(data);
        // Default to the first city in the Excel list
        setSelectedCity(data[0]); 
      } catch (err) {
        setError("Could not connect to the backend server. Make sure server.js is running.");
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // 2. "Bulletproof" Matching Logic for the Dropdown
  const handleCityChange = (cityName) => {
    if (!cityName) return;

    // Find city by stripping spaces and forcing uppercase to ensure a perfect match
    const city = allData.find(d => {
      const excelName = (d.Division || d.name || "").toString().replace(/\s+/g, '').toUpperCase();
      const selectedName = cityName.toString().replace(/\s+/g, '').toUpperCase();
      return excelName === selectedName;
    });

    if (city) {
      setSelectedCity(city);
      console.log("Matched City Data:", city); //
    }
  };

  // Error/Loading States
  if (error) return <div style={styles.error}>{error}</div>; //
  if (!selectedCity) return <div style={styles.loading}>Loading ALS Data...</div>; //

  return (
    <div style={styles.pageContainer}>
      {/* 3. Pass data and handler to Navigation */}
      <TopNavigation 
        divisions={allData} 
        onCitySelect={handleCityChange} 
      />
      
      <main style={styles.mainContent}>
        {/* Toggle Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => setView("AE")} 
            style={{ ...styles.btn, ...(view === "AE" ? styles.activeAE : styles.inactive) }}
          >
            A&E PROGRAM DATA
          </button>
          <button 
            onClick={() => setView("ADMIN")} 
            style={{ ...styles.btn, ...(view === "ADMIN" ? styles.activeAdmin : styles.inactive) }}
          >
            ADMINISTRATIVE DATA
          </button>
        </div>

        {/* 4. Conditional View Rendering */}
        {view === "AE" ? (
          <>
            <StatCards type="AE" cityData={selectedCity} />
            <LearningStrandsChart cityData={selectedCity} />
          </>
        ) : (
          <>
            <StatCards type="ADMIN" cityData={selectedCity} />
            <PersonnelChart cityData={selectedCity} />
          </>
        )}
      </main>
    </div>
  );
};

// --- CSS-in-JS Styles ---
const styles = {
  pageContainer: { 
    backgroundColor: "#f8fafc", 
    minHeight: "100vh" 
  },
  mainContent: { 
    maxWidth: "1250px", 
    margin: "0 auto", 
    padding: "30px 20px" 
  },
  buttonGroup: { 
    display: "flex", 
    gap: "12px", 
    marginBottom: "30px" 
  },
  btn: { 
    padding: "12px 24px", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold",
    transition: "0.3s"
  },
  inactive: { backgroundColor: "#e2e8f0", color: "#64748b" },
  activeAE: { backgroundColor: "#3b82f6", color: "#fff" },
  activeAdmin: { backgroundColor: "#10b981", color: "#fff" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", fontWeight: "bold" },
  error: { color: "red", textAlign: "center", marginTop: "50px", padding: "20px", fontWeight: "bold" }
};

export default Dashboard;