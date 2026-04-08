import React, { useState, useEffect } from "react";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import "./Dashboard.css"; // Import the new CSS file

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    // Fetches the processed data from your backend
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        setAllData(data);
        if (data.length > 0) setSelectedCity(data[0]);
      })
      .catch(err => console.log("Waiting for backend...", err));
  }, []);

  const handleCityChange = (cityName) => {
    const city = allData.find(d => d.Division === cityName);
    if (city) setSelectedCity(city);
  };

  if (!selectedCity) {
    return <div className="empty-state">Loading ALS NCR Data...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <TopNavigation divisions={allData} onCitySelect={handleCityChange} />
      
      <main className="dashboard-content">
        {/* Statistics Section */}
        <StatCards cityData={selectedCity} />

        {/* Personnel Registry Section */}
        <div className="registry-card">
          <div className="registry-header">
            <h3>Personnel Registry: {selectedCity.Division}</h3>
            <p>Active Alternative Learning System (ALS) Implementers</p>
          </div>

          <div className="teacher-grid">
            {selectedCity.TeacherList && selectedCity.TeacherList.length > 0 ? (
              selectedCity.TeacherList.map((name, index) => (
                <div key={index} className="teacher-item">
                  <span className="teacher-number">{index + 1}</span>
                  {name}
                </div>
              ))
            ) : (
              <div className="empty-state">No personnel records found for this division.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;