const { buildSchoolsDirectory } = require("../lib/workbookData");

module.exports = (_req, res) => {
  try {
    res.status(200).json(buildSchoolsDirectory());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
