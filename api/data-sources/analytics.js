const { buildCombinedSummary } = require("../../lib/excelSourceRegistry");

module.exports = async (_req, res) => {
  try {
    const combined = await buildCombinedSummary();
    res.status(200).json(combined.summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
