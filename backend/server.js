const express = require('express');
const xlsx = require('xlsx');
const cors = require('cors');
const app = express();

// 1. Fixes the "CORS" error from your screenshot
app.use(cors());

app.get('/api/data', (req, res) => {
  try {
    // 2. Reads your specific Excel file
    const workbook = xlsx.readFile('data.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // 3. Logic to group individual names into division totals
    const summary = rawData.reduce((acc, row) => {
      const divId = row.division_id || "Unknown";
      
      if (!acc[divId]) {
        // Mapping your IDs to the city names shown in your dropdown
        const divNames = { 
          1: "CALOOCAN", 
          2: "LAS PIÑAS", 
          3: "MAKATI", 
          4: "MALABON",
          5: "MANDALUYONG",
          6: "MANILA" ,
          7: "MARIKINA",
          8: "MUNTINLUPA",
          9: "NAVOTAS",
          10: "PARAÑAQUE",
          11: "PASAY",
          12: "PASIG",
          13: "QUEZON CITY",
          14: "SAN JUAN",
          15: "TAGUIG & PATEROS",
          16: "VALENZUELA"

        }; 
        
        acc[divId] = { 
          Division: divNames[divId] || `Division ${divId}`,
          "Teacher I": 0, "Teacher II": 0, "Teacher III": 0,
          "Master Teacher I": 0, "Master Teacher II": 0,
          "Passers": 0, "Total_Learners": 0, "Enrolled": 0
        };
      }

      // Increment counts based on the 'position' column
      if (row.position) {
        acc[divId][row.position] = (acc[divId][row.position] || 0) + 1;
      }
      
      return acc;
    }, {});

    // 4. Sends the processed data to your Dashboard
    console.log("Data processed successfully for dashboard.");
    res.json(Object.values(summary));

  } catch (error) {
    console.error("Error reading Excel:", error);
    res.status(500).json({ error: "Could not process Excel data" });
  }
});

// Starts the server on the port your Dashboard is looking for
app.listen(5000, () => {
  console.log('Backend server running at http://localhost:5000');
});