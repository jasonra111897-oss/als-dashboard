const fs = require("fs");
const path = require("path");
const { buildClcshaDatasetFromExcel } = require("../lib/clcshaWorkbook");

const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "data", "generated");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "clcsha-dataset.json");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const dataset = buildClcshaDatasetFromExcel();
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset));

const stats = fs.statSync(OUTPUT_PATH);

console.log(
  JSON.stringify(
    {
      output: OUTPUT_PATH,
      sheets: dataset.sheets.length,
      records: dataset.records.length,
      bytes: stats.size,
    },
    null,
    2
  )
);
