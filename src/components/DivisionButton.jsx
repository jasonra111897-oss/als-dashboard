import React from "react";

function DivisionButton({ div, isActive, onClick }) {
  return (
    <button 
      onClick={() => onClick(div.id)}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "12px 15px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        // Active vs Inactive styling
        background: isActive ? "#4a90e2" : "white", 
        color: isActive ? "white" : "#003366",
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      {div.name || div.Name}
    </button>
  );
}

export default DivisionButton;