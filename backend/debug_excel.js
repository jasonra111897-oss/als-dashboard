const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const FILE_PATH = path.join(__dirname, "data.xlsx");

const debugExcel = () => {
  console.log("--- EXCEL DEBUG START ---");
  
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ ERROR: Could not find file at: ${FILE_PATH}`);
    return;
  }

  try {
    const fileBuffer = fs.readFileSync(FILE_PATH);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
    console.log("✅ File found and readable.");
    console.log("📂 Sheet names found in your file:");
    
    workbook.SheetNames.forEach((name, index) => {
      console.log(`   ${index + 1}. "${name}"`);
    });

    console.log("\n💡 MATCHING CHECK:");
    const requiredSheets = ["divisions", "teachers", "schools"];
    requiredSheets.forEach(required => {
      const match = workbook.SheetNames.find(n => n.toLowerCase().trim() === required);
      if (match) {
        console.log(`   ✅ "${required}" -> Found match as "${match}"`);
      } else {
        console.log(`   ❌ "${required}" -> NO MATCH FOUND`);
      }
    });

  } catch (err) {
    console.error("❌ ERROR reading file:", err.message);
  }
  
  console.log("--- EXCEL DEBUG END ---");
};

debugExcel();