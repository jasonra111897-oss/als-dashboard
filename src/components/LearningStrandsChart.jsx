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
import "./LearningStrandsChart.css";

// 1. Register components first
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LearningStrandsChart = () => {
  // 2. Define strandData INSIDE the component so it is "defined"
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
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
      },
      {
        label: 'Secondary Learners',
        data: [75, 82, 70, 91, 76, 88],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
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
      y: { beginAtZero: true, max: 100 },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Learning Strand Performance</h3>
        <p className="chart-subtitle">Competency levels for Elementary and Secondary levels</p>
      </div>
      <div className="chart-wrapper" style={{ height: "400px" }}>
        <Bar data={strandData} options={chartOptions} />
      </div>
    </div>
  );
};

// 3. Ensure the default export is present at the bottom!
export default LearningStrandsChart;