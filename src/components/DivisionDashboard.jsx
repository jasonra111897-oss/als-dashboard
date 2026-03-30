import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DivisionDashboard({ divisionId, divisions }) {
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const currentDiv = divisions.find(d => String(d.id) === String(divisionId));

  useEffect(() => {
    const fetchDivisionData = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          axios.get(`http://localhost:5000/teachers/${divisionId}`),
          axios.get(`http://localhost:5000/schools/${divisionId}`)
        ]);
        setTeachers(tRes.data);
        setSchools(sRes.data);
      } catch (err) {
        console.error("Error loading division data:", err);
      }
    };
    if (divisionId) fetchDivisionData();
  }, [divisionId]);

  // Logic to count positions for the chart
  const positionCounts = teachers.reduce((acc, curr) => {
    const pos = curr.position || curr.Position || "N/A";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(positionCounts),
    datasets: [
      {
        label: 'Number of Personnel',
        data: Object.values(positionCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Personnel Distribution: ${currentDiv?.name || ""}` },
    },
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <div className="card" style={cardStyle}>
          <h3>ALS Implementers</h3>
          <p style={{ fontSize: "48px", fontWeight: "bold" }}>{teachers.length}</p>
        </div>
        <div className="card" style={cardStyle}>
          <h3>Schools with ALS</h3>
          <p style={{ fontSize: "48px", fontWeight: "bold" }}>{schools.length}</p>
        </div>
      </div>

      {/* CHART SECTION: Replaces the Table */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        height: "400px" 
      }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

export default DivisionDashboard;