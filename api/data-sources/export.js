const { exportDatasetRowsCsv } = require("../../lib/excelSourceRegistry");

module.exports = async (req, res) => {
  try {
    const csv = await exportDatasetRowsCsv({
      sourceId: req.query?.sourceId || "all",
      sheetName: req.query?.sheetName || "all",
      search: req.query?.search || "",
      sortBy: req.query?.sortBy || "_source",
      sortDir: req.query?.sortDir || "asc",
      dedupe: String(req.query?.dedupe || "true").toLowerCase() !== "false",
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="als-data-export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
