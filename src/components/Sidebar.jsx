import React from "react";

function Sidebar({ setDivision, selectedDivision, divisions }) {
  return (
    <div style={{ width: "260px", backgroundColor: "#001f3f", color: "white", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>ALS System</h2>
      
      <button 
        onClick={() => setDivision(null)}
        style={{
          width: "100%", padding: "12px", marginBottom: "20px", cursor: "pointer",
          backgroundColor: !selectedDivision ? "#2563eb" : "transparent",
          color: "white", border: "1px solid #3b82f6", borderRadius: "8px"
        }}
      >
        🏠 Home
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT DIVISION:</label>
        <select 
          value={selectedDivision || ""} 
          onChange={(e) => setDivision(e.target.value || null)}
          style={{ padding: "12px", borderRadius: "8px", width: "100%" }}
        >
          <option value="">-- Choose --</option>
          {divisions.length > 0 ? (
            divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name} {/* Matches "name" key in your Excel data */}
              </option>
            ))
          ) : (
            <option disabled>No Divisions Loaded</option>
          )}
        </select>
      </div>
    </div>
  );
}

export default Sidebar;