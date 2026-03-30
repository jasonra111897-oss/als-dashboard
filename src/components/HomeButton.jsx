import React from "react";

function HomeButton({ isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "20px",
        padding: "12px 15px",
        borderRadius: "6px",
        border: "1px solid #4a90e2",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        // Logic to switch colors based on selection
        background: isSelected ? "#4a90e2" : "transparent",
        color: isSelected ? "white" : "white",
        fontWeight: isSelected ? "bold" : "normal",
      }}
    >
      <span style={{ marginRight: "10px" }}>🏠</span>
      Home
    </button>
  );
}

export default HomeButton;