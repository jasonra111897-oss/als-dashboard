import React from "react";
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

// Register ChartJS components for this specific file
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LearningStrandsChart = () => {
  // Data aligned with ALS A&E Competencies
  const strandData = {
    labels: [
      "LS1: Communication", 
      "LS2: Science", 
      "LS3: Math", 
      "LS4: Life & Career", 
      "LS5: Self & Society", 
      "LS6: Digital Literacy"
    ],
    datasets: [
      {
        label: 'Elementary Learners',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
        borderRadius: 8,
      },
      {
        label: 'Secondary Learners',
        data: [75, 82, 70, 91, 76, 88],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
        borderRadius: 8,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div style={chartContainer}>
      <div style={chartHeader}>
        <h3 style={chartTitle}>Learning Strand Performance</h3>
        <p style={chartSubtitle}>Competency levels for Elementary and Secondary levels</p>
      </div>
      <div style={{ height: "400px" }}>
        <Bar data={strandData} options={chartOptions} />
      </div>
    </div>
  );
};

// Styles extracted for the chart container
const chartContainer = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  padding: "30px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  border: "1px solid #e2e8f0",
  marginTop: "40px"
};

const chartHeader = { marginBottom: "25px" };
const chartTitle = { margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" };
const chartSubtitle = { margin: "5px 0 0 0", fontSize: "14px", color: "#64748b" };

export default LearningStrandsChart;