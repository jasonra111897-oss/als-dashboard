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
} from "chart.js";
import "./LearningStrandsChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LearningStrandsChart = ({ cityData }) => {
  const positionCounts = (cityData?.teacherList || []).reduce((counts, teacher) => {
    const position = teacher?.position || "Unassigned";
    counts[position] = (counts[position] || 0) + 1;
    return counts;
  }, {});

  const positionEntries = Object.entries(positionCounts).sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  );

  const chartData = {
    labels: positionEntries.map(([position]) => position),
    datasets: [
      {
        label: "Implementers",
        data: positionEntries.map(([, count]) => count),
        backgroundColor: [
          "rgba(24, 58, 117, 0.92)",
          "rgba(33, 98, 190, 0.84)",
          "rgba(52, 130, 214, 0.78)",
          "rgba(104, 161, 227, 0.72)",
          "rgba(248, 185, 63, 0.84)",
        ],
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(15, 23, 42, 0.08)" },
      },
      x: { grid: { display: false } },
    },
  };

  const topPosition = positionEntries[0];
  const secondPosition = positionEntries[1];

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <span className="chart-kicker">Division Insight</span>
          <h3 className="chart-title">Division Position Distribution</h3>
          <p className="chart-subtitle">
            Live personnel mix for {cityData?.division || "the selected division"}
          </p>
        </div>
        <div className="chart-snapshot">
          <div className="chart-snapshot-card">
            <span>Top Role</span>
            <strong>{topPosition?.[0] || "No data"}</strong>
            <small>{topPosition ? `${topPosition[1]} implementers` : "Awaiting data"}</small>
          </div>
          <div className="chart-snapshot-card">
            <span>Second Largest</span>
            <strong>{secondPosition?.[0] || "No data"}</strong>
            <small>{secondPosition ? `${secondPosition[1]} implementers` : "Awaiting data"}</small>
          </div>
        </div>
      </div>
      <div className="chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default LearningStrandsChart;
