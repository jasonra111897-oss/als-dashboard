const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const {
  buildDashboardData,
  buildEnrollmentData,
  buildSchoolsDirectory,
} = require("../lib/workbookData");
const {
  listDataSources,
  queryDatasetRows,
  exportDatasetRowsCsv,
  uploadDataSourceFile,
  buildCombinedSummary,
} = require("../lib/excelSourceRegistry");
const {
  buildClcshaCenters,
  getClcshaSummary,
  queryClcshaRows,
} = require("../lib/clcshaWorkbook");
const { fetchDepedNewsFeed } = require("../lib/newsFeed");

const app = express();
const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = path.join(__dirname, "..");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");

app.use(cors());
app.use(express.json({ limit: "30mb" }));

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

app.get("/api/clcsha", (_req, res) => {
  try {
    res.json(getClcshaSummary());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clcsha/rows", (req, res) => {
  try {
    const {
      division = "all",
      sheetName = "all",
      search = "",
      sortBy = "division",
      sortDir = "asc",
      page = "1",
      pageSize = "25",
    } = req.query;

    res.json(
      queryClcshaRows({
        division,
        sheetName,
        search,
        sortBy,
        sortDir,
        page: Number(page),
        pageSize: Number(pageSize),
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clcsha/centers", (_req, res) => {
  try {
    res.json(buildClcshaCenters());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/news/deped", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);
    const items = await fetchDepedNewsFeed(Number.isFinite(limit) && limit > 0 ? limit : 6);

    res.json({
      source: "Department of Education",
      fetchedAt: new Date().toISOString(),
      items,
    });
  } catch (error) {
    res.status(502).json({
      error: error.message || "Unable to load the DepEd official news feed.",
    });
  }
});

app.get("/api/data-sources", async (_req, res) => {
  try {
    res.json(await listDataSources());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data-sources/analytics", async (_req, res) => {
  try {
    const combined = await buildCombinedSummary();
    res.json(combined.summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data-sources/rows", async (req, res) => {
  try {
    const {
      sourceId = "all",
      sheetName = "all",
      search = "",
      sortBy = "_source",
      sortDir = "asc",
      page = "1",
      pageSize = "20",
      dedupe = "true",
    } = req.query;

    res.json(
      await queryDatasetRows({
        sourceId,
        sheetName,
        search,
        sortBy,
        sortDir,
        page: Number(page),
        pageSize: Number(pageSize),
        dedupe: String(dedupe).toLowerCase() !== "false",
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data-sources/export", async (req, res) => {
  try {
    const csv = await exportDatasetRowsCsv({
      sourceId: req.query.sourceId || "all",
      sheetName: req.query.sheetName || "all",
      search: req.query.search || "",
      sortBy: req.query.sortBy || "_source",
      sortDir: req.query.sortDir || "asc",
      dedupe: String(req.query.dedupe || "true").toLowerCase() !== "false",
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="als-data-export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/data-sources/upload", async (req, res) => {
  try {
    const { sourceId, fileName, fileContentBase64 } = req.body || {};

    if (!sourceId || !fileContentBase64) {
      res.status(400).json({ error: "sourceId and fileContentBase64 are required." });
      return;
    }

    const source = await uploadDataSourceFile({ sourceId, fileName, fileContentBase64 });
    const listing = await listDataSources();

    res.status(200).json({
      message: `${source.label} uploaded successfully.`,
      source: listing.sources.find((item) => item.id === sourceId) || null,
      summary: listing.summary,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
