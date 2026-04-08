const express = require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

// --- 1. CONVERT ROUTE (READS ALL SHEETS) ---
app.get('/api/convert', (req, res) => {
  try {
    const excelPath = path.join(__dirname, '..', 'data.xlsx');
    const outputFolder = path.join(__dirname, '..', 'frontend', 'src', 'components');
    const outputPath = path.join(outputFolder, 'data.json');

    const workbook = xlsx.readFile(excelPath);

    // 1. Explicitly pull from the 'divisions' sheet
    const divisionsData = xlsx.utils.sheet_to_json(workbook.Sheets['divisions']);
    const teachersData = xlsx.utils.sheet_to_json(workbook.Sheets['teachers']);
    const schoolsData = xlsx.utils.sheet_to_json(workbook.Sheets['schools']);

    // 2. Map IDs to Names
    const summary = {};
    divisionsData.forEach(row => {
      summary[row.id] = {
        Division: row.name.toUpperCase(),
        "Total Schools": 0,
        "Total Implementers": 0,
        "Active Divisions": 1
      };
    });

    // 3. Count Implementers from the 'teachers' sheet
    teachersData.forEach(t => {
  const divId = t.division_id;
  if (summary[divId]) {
    summary[divId]["Total Implementers"] += 1;
    
   
    if (!summary[divId].TeacherList) {
      summary[divId].TeacherList = [];
    }
    summary[divId].TeacherList.push(t.name); 
  }
});

    
    schoolsData.forEach(s => {
      if (summary[s.division_id]) {
        summary[s.division_id]["Total Schools"] += 1;
      }
    });

    const finalData = Object.values(summary);

    // Ensure directory exists and save
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    res.json({ message: "Success! Data processed from all sheets.", data: finalData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 2. DATA ROUTE ---
app.get('/api/data', (req, res) => {
    const jsonPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'data.json');
    if (fs.existsSync(jsonPath)) {
        res.sendFile(jsonPath);
    } else {
        res.status(404).json({ error: "No data.json found yet." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`SERVER IS ACTIVE ON PORT ${PORT}`);
    console.log(`Visit: http://localhost:5000/api/convert`);
    console.log(`=================================`);
});