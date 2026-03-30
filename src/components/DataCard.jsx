import React from "react";

function DataCard({ title, count, items, renderItem }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ margin: 0, color: "#003366" }}>{title}</h3>
      <div style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
        {count}
      </div>
      <hr style={{ border: "0", borderTop: "1px solid #eee", width: "100%" }} />
      
      <div style={listContainerStyle}>
        {items.map((item, index) => (
          <div key={item.id || index} style={entryStyle}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Re-using your organized styles
const cardStyle = {
  flex: 1, padding: "20px", background: "white", borderRadius: "12px",
  border: "1px solid #e0e0e0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  display: "flex", flexDirection: "column", height: "550px"
};

const listContainerStyle = { marginTop: "10px", overflowY: "auto", flex: 1 };

const entryStyle = { padding: "12px 0", borderBottom: "1px solid #f5f5f5" };

export default DataCard;