const { listDataSources } = require("../../lib/excelSourceRegistry");

module.exports = async (_req, res) => {
  try {
    res.status(200).json(await listDataSources());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
