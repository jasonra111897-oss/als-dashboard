const express = require('express');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Load Excel once when server starts
const workbook = xlsx.readFile(path.join(__dirname, 'data.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = xlsx.utils.sheet_to_json(sheet);

// Fix the 404s by adding these routes
app.get('/divisions', (req, res) => res.json(excelData));
app.get('/all-teachers', (req, res) => res.json(excelData));
app.get('/all-schools', (req, res) => res.json(excelData));
app.get('/api/data', (req, res) => res.json(excelData));

app.listen(5000, () => console.log("Backend running on port 5000"));