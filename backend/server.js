const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const {
  buildDashboardData,
  buildEnrollmentData,
  buildSchoolsDirectory,
} = require("../lib/workbookData");

const app = express();
const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = path.join(__dirname, "..");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");

app.use(cors());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/convert", (_req, res) => {
  try {
    const data = buildDashboardData();
    res.json({
      message: "Dashboard data generated from workbook.",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data", (_req, res) => {
  try {
    res.json(buildDashboardData());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/schools", (_req, res) => {
  try {
    res.json(buildSchoolsDirectory());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/enrolment", (_req, res) => {
  try {
    res.json(buildEnrollmentData());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_PATH, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`SERVER IS ACTIVE ON PORT ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/data`);
  console.log("=================================");
});
