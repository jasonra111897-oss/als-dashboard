const { queryDatasetRows } = require("../../lib/excelSourceRegistry");

module.exports = async (req, res) => {
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
    } = req.query || {};

    res.status(200).json(
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
};
