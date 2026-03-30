import React, { useEffect, useState } from "react";
import axios from "axios";

function SchoolList() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Calling the 'all-schools' route we created in your server.js
    axios.get("http://localhost:5000/all-schools")
      .then(res => setSchools(res.data))
      .catch(err => console.error("Error fetching schools:", err));
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "8px" }}>
      <h2>Schools Offering ALS (NCR)</h2>
      <ul style={{ lineHeight: "2" }}>
        {schools.map((school, index) => (
          <li key={index}>
            <strong>{school.school_name || school.SchoolName}</strong> 
            <span style={{ color: "#666", marginLeft: "10px" }}>
              ({school.division_name || "NCR Division"})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SchoolList;