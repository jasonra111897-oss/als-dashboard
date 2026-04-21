const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const PROJECT_ROOT = path.join(__dirname, "..");
const EXCEL_PATH = path.join(PROJECT_ROOT, "data.xlsx");

const normalizeSheetName = (name) => String(name || "").trim().toLowerCase();
const normalizeDivisionName = (name) => String(name || "").trim().toUpperCase();

const coerceCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeEnrollmentDivisionName = (name) => {
  const normalizedName = normalizeDivisionName(name);

  if (normalizedName === "TAPAT") {
    return "TAGUIG CITY & PATEROS";
  }

  return normalizedName;
};

const getWorksheet = (workbook, sheetName) => {
  const matchedSheet = workbook.SheetNames.find(
    (name) => normalizeSheetName(name) === normalizeSheetName(sheetName)
  );

  if (!matchedSheet) {
    throw new Error(`Required sheet "${sheetName}" was not found in data.xlsx.`);
  }

  return workbook.Sheets[matchedSheet];
};

const readWorkbook = () => {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel file not found at ${EXCEL_PATH}.`);
  }

  return xlsx.readFile(EXCEL_PATH);
};

const readWorkbookData = () => {
  const workbook = readWorkbook();
  const divisionsSheet = getWorksheet(workbook, "divisions");
  const teachersSheet = getWorksheet(workbook, "teachers");
  const schoolsSheet = getWorksheet(workbook, "schools");

  const divisionsData = xlsx.utils.sheet_to_json(divisionsSheet, { defval: "" });
  const teachersData = xlsx.utils.sheet_to_json(teachersSheet, { defval: "" });
  const schoolsData = xlsx.utils.sheet_to_json(schoolsSheet, { defval: "" });

  return {
    divisionsData,
    teachersData,
    schoolsData,
    workbook,
  };
};

const buildDivisionLookup = (divisionsData) => {
  const divisionsById = new Map();
  const divisionNamesById = new Map();

  divisionsData.forEach((row) => {
    if (row.id === undefined || row.id === null || !row.name) {
      return;
    }

    const divisionId = String(row.id);
    const divisionName = normalizeDivisionName(row.name);

    divisionNamesById.set(divisionId, divisionName);
    divisionsById.set(divisionId, {
      divisionId: row.id,
      division: divisionName,
      totalSchools: 0,
      totalImplementers: 0,
      activeDivisions: 1,
      teacherList: [],
    });
  });

  return { divisionsById, divisionNamesById };
};

const buildDashboardData = () => {
  const { divisionsData, teachersData, schoolsData } = readWorkbookData();
  const { divisionsById } = buildDivisionLookup(divisionsData);

  teachersData.forEach((teacher) => {
    const division = divisionsById.get(String(teacher.division_id));
    if (!division) {
      return;
    }

    division.totalImplementers += 1;
    division.teacherList.push({
      id: teacher.id ?? null,
      name: String(teacher.name || "Unknown Personnel").trim(),
      position: String(teacher.position || "N/A").trim() || "N/A",
    });
  });

  schoolsData.forEach((school) => {
    const division = divisionsById.get(String(school.division_id));
    if (!division) {
      return;
    }

    division.totalSchools += coerceCount(school.count) || 1;
  });

  return Array.from(divisionsById.values()).sort((left, right) =>
    left.division.localeCompare(right.division)
  );
};

const buildSchoolsDirectory = () => {
  const { divisionsData, teachersData, schoolsData } = readWorkbookData();
  const { divisionNamesById } = buildDivisionLookup(divisionsData);

  const implementerCountsByDivision = teachersData.reduce((counts, teacher) => {
    const divisionId = String(teacher.division_id);
    counts.set(divisionId, (counts.get(divisionId) || 0) + 1);
    return counts;
  }, new Map());

  const schools = schoolsData
    .map((school) => {
      const divisionId = String(school.division_id);

      return {
        schoolId: school.id ?? null,
        schoolName: String(school.school_name || school.SchoolName || school.name || "").trim(),
        divisionId: school.division_id ?? null,
        division: divisionNamesById.get(divisionId) || divisionId,
        category: String(school.category || "Unspecified").trim() || "Unspecified",
        divisionImplementerCount: implementerCountsByDivision.get(divisionId) || 0,
      };
    })
    .sort((left, right) => left.division.localeCompare(right.division));

  return {
    totalSchools: schools.length,
    totalDivisions: new Set(schools.map((school) => school.division)).size,
    schools,
  };
};

const buildEnrollmentData = () => {
  const { divisionsData, workbook } = readWorkbookData();
  const enrolmentSheet = getWorksheet(workbook, "enrolment");
  const rows = xlsx.utils.sheet_to_json(enrolmentSheet, { defval: "" });

  const totalsRow = rows.find(
    (row) => !String(row.Division || "").trim() && coerceCount(row.__EMPTY_9) > 0
  );

  const divisionSet = new Set(divisionsData.map((division) => normalizeDivisionName(division.name)));

  const divisions = rows
    .filter((row) => String(row.Division || "").trim())
    .map((row) => {
      const division = normalizeEnrollmentDivisionName(row.Division);
      return {
        division,
        basicLiteracyProgram: {
          male: coerceCount(row["Basic Literacy Program"]),
          female: coerceCount(row.__EMPTY),
          total: coerceCount(row.__EMPTY_1),
        },
        aeElementary: {
          male: coerceCount(row["A&E Elementary"]),
          female: coerceCount(row.__EMPTY_2),
          total: coerceCount(row.__EMPTY_3),
        },
        aeJuniorHighSchool: {
          male: coerceCount(row["A&E Junior High School"]),
          female: coerceCount(row.__EMPTY_4),
          total: coerceCount(row.__EMPTY_5),
        },
        bpOsaMandaluyong: {
          male: coerceCount(row["BP-OSA - Mandaluyong only"]),
          female: coerceCount(row.__EMPTY_6),
          total: coerceCount(row.__EMPTY_7),
        },
        grandTotal: {
          male: coerceCount(row["Grand Total"]),
          female: coerceCount(row.__EMPTY_8),
          total: coerceCount(row.__EMPTY_9),
        },
      };
    })
    .filter((row) => divisionSet.has(row.division))
    .sort((left, right) => left.division.localeCompare(right.division));

  return {
    schoolYear: "2025-2026",
    totals: {
      basicLiteracyProgram: {
        male: coerceCount(totalsRow?.["Basic Literacy Program"]),
        female: coerceCount(totalsRow?.__EMPTY),
        total: coerceCount(totalsRow?.__EMPTY_1),
      },
      aeElementary: {
        male: coerceCount(totalsRow?.["A&E Elementary"]),
        female: coerceCount(totalsRow?.__EMPTY_2),
        total: coerceCount(totalsRow?.__EMPTY_3),
      },
      aeJuniorHighSchool: {
        male: coerceCount(totalsRow?.["A&E Junior High School"]),
        female: coerceCount(totalsRow?.__EMPTY_4),
        total: coerceCount(totalsRow?.__EMPTY_5),
      },
      bpOsaMandaluyong: {
        male: coerceCount(totalsRow?.["BP-OSA - Mandaluyong only"]),
        female: coerceCount(totalsRow?.__EMPTY_6),
        total: coerceCount(totalsRow?.__EMPTY_7),
      },
      grandTotal: {
        male: coerceCount(totalsRow?.["Grand Total"]),
        female: coerceCount(totalsRow?.__EMPTY_8),
        total: coerceCount(totalsRow?.__EMPTY_9),
      },
    },
    divisions,
  };
};

module.exports = {
  buildDashboardData,
  buildEnrollmentData,
  buildSchoolsDirectory,
};
