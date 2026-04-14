import React, { useState, useEffect } from "react";
import TopNavigation from "./TopNavigation";
import StatCards from "./StatCards";
import LearningStrandsChart from "./LearningStrandsChart";
import NCROverview from "./NCROverview";
import PersonnelModal from "./PersonnelModal";
import "./Dashboard.css";
import "./TopNavigation.css";
import "./StatCards.css";
 

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        setAllData(data);
        
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  const handleCityChange = (cityName) => {
    if (cityName === "") {
      resetToHome();
      return;
    }
    const city = allData.find(d => d.Division === cityName);
    if (city) {
      setSelectedCity(city);
      setSelectedTeacher(null);
      setSearchTerm("");
    }
  };

  const resetToHome = () => {
    setSelectedCity(null);
    setSearchTerm("");
    setSelectedTeacher(null);
  };

  const filteredTeachers = (selectedCity?.TeacherList || []).filter(teacher => {
    if (!teacher) return false;
    const nameToSearch = typeof teacher === 'object' ? teacher.name : teacher;
    return String(nameToSearch).toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (allData.length === 0) {
    return <div className="loading-screen">Loading ALS NCR Dashboard...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <TopNavigation 
        divisions={allData} 
        onCitySelect={handleCityChange} 
        onHomeClick={resetToHome} 
        currentSelection={selectedCity?.Division || ""}
      />
      
      <main className="dashboard-content">
        {selectedCity ? (
          <>
            <StatCards cityData={selectedCity} />
            <LearningStrandsChart />

            <div className="registry-card">
              <div className="registry-header">
                <div className="header-text">
                  <h3>PERSONNEL REGISTRY: {selectedCity.Division}</h3>
                  <p>Active Alternative Learning System (ALS) Implementers</p>
                </div>
                
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Search personnel name..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="teacher-grid">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher, index) => {
                    const displayName = typeof teacher === 'object' ? teacher.name : teacher;
                    return (
                      <div 
                        key={index} 
                        className="teacher-item clickable" 
                        onClick={() => setSelectedTeacher({ 
                          name: displayName, 
                          division: selectedCity.Division,
                          position: teacher.position || "ALS Implementer"
                        })}
                      >
                        <div className="teacher-info">
                          <span className="teacher-name">{displayName}</span>
                          <span className="teacher-badge">ALS Implementer</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <p>No personnel records found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <NCROverview allData={allData} />
        )}

        {/* Profile Modal Overlay */}
        {selectedTeacher && (
          <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Personnel Profile</h2>
                <button className="close-btn" onClick={() => setSelectedTeacher(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="profile-avatar">{String(selectedTeacher.name).charAt(0)}</div>
                <h1 className="profile-name">{selectedTeacher.name}</h1>
                <p className="profile-division">{selectedTeacher.division}</p>
                <div className="profile-details">
                   <div className="detail-row"><strong>Position:</strong> <span>{selectedTeacher.position}</span></div>
                   <div className="detail-row"><strong>Status:</strong> <span className="status-badge">Active</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;