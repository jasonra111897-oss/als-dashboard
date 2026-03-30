import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PersonnelChart = ({ cityData }) => {
  const data = {
    labels: ["Teacher I", "Teacher II", "Teacher III", "Master Teacher I", "Master Teacher II", "DALSC"],
    datasets: [{
      label: 'Staff Count',
      // Force conversion to Number just in case Excel saved them as text
      data: [
        Number(cityData["Teacher I"] || 0),
        Number(cityData["Teacher II"] || 0),
        Number(cityData["Teacher III"] || 0),
        Number(cityData["Master Teacher I"] || 0),
        Number(cityData["Master Teacher II"] || 0),
        Number(cityData["DALSC"] || 0)
      ],
      backgroundColor: '#10b981',
      borderRadius: 8,
    }]
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "15px", height: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <Bar 
        data={data} 
        options={{ 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Personnel Distribution', font: { size: 18 } } }
        }} 
      />
    </div>
  );
};

export default PersonnelChart;