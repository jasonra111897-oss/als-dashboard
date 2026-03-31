import React, { useState, useEffect } from "react";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Change this URL to your deployed backend when moving to Vercel
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setAllData(data);
        setSelectedCity(data[0]); 
      } catch (err) {
        setError("Could not connect to backend. Ensure server.js is running locally.");
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleCityChange = (cityName) => {
    const city = allData.find(d => 
      (d.Division || "").toUpperCase() === cityName.toUpperCase()
    );
    if (city) setSelectedCity(city);
  };

  if (error) return <div style={styles.error}>{error}</div>;
  if (!selectedCity) return <div style={styles.loading}>Loading Dashboard...</div>;

  return (
    <div style={styles.pageContainer}>
      <TopNavigation 
        divisions={allData} 
        onCitySelect={handleCityChange} 
      />
      
      <main style={styles.mainContent}>
        {/* Restored Global Dashboard Header */}
        <div style={styles.dashboardHeader}>
          <h2 style={styles.mainTitle}>ALS Global Dashboard</h2>
          <p style={styles.subTitleText}>NCR Region | System Statistics</p>
        </div>

        {/* Updated Cards: No Charts */}
        <StatCards cityData={selectedCity} />
      </main>
    </div>
  );
};

const styles = {
  pageContainer: { backgroundColor: "#f1f5f9", minHeight: "100vh" },
  mainContent: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  dashboardHeader: { marginBottom: "30px" },
  mainTitle: { fontSize: "28px", color: "#1e293b", fontWeight: "bold", margin: "0 0 5px 0" },
  subTitleText: { color: "#64748b", fontSize: "14px", margin: 0 },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  error: { color: "red", textAlign: "center", marginTop: "50px" }
};

export default Dashboard;