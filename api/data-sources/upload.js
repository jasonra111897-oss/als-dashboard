module.exports = async (_req, res) => {
  res.status(501).json({
    error:
      "Workbook uploads are not persisted in the deployed serverless environment. Use the local backend server for persistent Excel uploads.",
  });
};
