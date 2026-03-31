// server.js
const express = require('express');
const xlsx = require('xlsx');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/data', (req, res) => {
  const workbook = xlsx.readFile('data.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet);

  const summary = rawData.reduce((acc, row) => {
    const divId = row.division_id;
    if (!divId) return acc;

    if (!acc[divId]) {
      const divNames = { 1: "CALOOCAN", 2: "LAS PIÑAS", 3: "MAKATI" }; // Map IDs to Names
      acc[divId] = { 
        Division: divNames[divId] || `Division ${divId}`,
        "Total Schools": 0, // You can count unique IDs or CLCs here
        "Total Implementers": 0,
        "Active Divisions": 1 
      };
    }

    // Every row in your Excel represents an "Implementer" (Teacher)
    acc[divId]["Total Implementers"] += 1;
    
    return acc;
  }, {});

  res.json(Object.values(summary));
});

app.listen(5000, () => console.log('Server running on port 5000'));