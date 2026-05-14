const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const PROJECT_ROOT = path.join(__dirname, "..");
const CLCSHA_PATH = path.join(PROJECT_ROOT, "CLCSHA DB_NCR.xlsx");

const SKIPPED_SHEETS = new Set(["INSTRUCTIONS", "SHEET1"]);
const NCR_DIVISION_ALIASES = new Map([
  ["CALOOCAN", "CALOOCAN"],
  ["CALOOCAN CITY", "CALOOCAN"],
  ["CITY OF CALOOCAN", "CALOOCAN"],
  ["LAS PINAS", "LAS PI\u00d1AS"],
  ["LAS PI\u00d1AS", "LAS PI\u00d1AS"],
  ["LAS PI\u00c3\u2018AS", "LAS PI\u00d1AS"],
  ["LAS PINAS CITY", "LAS PI\u00d1AS"],
  ["LAS PI\u00d1AS CITY", "LAS PI\u00d1AS"],
  ["MAKATI", "MAKATI"],
  ["MAKATI CITY", "MAKATI"],
  ["MALABON", "MALABON"],
  ["MALABON CITY", "MALABON"],
  ["MANDALUYONG", "MANDALUYONG"],
  ["MANDALUYONG CITY", "MANDALUYONG"],
  ["MANILA", "MANILA"],
  ["CITY OF MANILA", "MANILA"],
  ["MANILA CITY", "MANILA"],
  ["MARIKINA", "MARIKINA"],
  ["MARIKINA CITY", "MARIKINA"],
  ["MUNTINLUPA", "MUNTINLUPA"],
  ["MUNTINLUPA CITY", "MUNTINLUPA"],
  ["NAVOTAS", "NAVOTAS"],
  ["NAVOTAS CITY", "NAVOTAS"],
  ["PARANAQUE", "PARA\u00d1AQUE"],
  ["PARA\u00d1AQUE", "PARA\u00d1AQUE"],
  ["PARA\u00c3\u2018AQUE", "PARA\u00d1AQUE"],
  ["PARANAQUE CITY", "PARA\u00d1AQUE"],
  ["PARA\u00d1AQUE CITY", "PARA\u00d1AQUE"],
  ["PASAY", "PASAY"],
  ["PASAY CITY", "PASAY"],
  ["PASIG", "PASIG"],
  ["PASIG CITY", "PASIG"],
  ["QUEZON", "QUEZON CITY"],
  ["QUEZON CITY", "QUEZON CITY"],
  ["SAN JUAN", "SAN JUAN"],
  ["SAN JUAN CITY", "SAN JUAN"],
  ["TAGUIG CITY & PATEROS", "TAGUIG CITY & PATEROS"],
  ["TAGUIG CITY AND PATEROS", "TAGUIG CITY & PATEROS"],
  ["TAGUIG & PATEROS", "TAGUIG CITY & PATEROS"],
  ["TAGUIG CITY", "TAGUIG CITY & PATEROS"],
  ["PATEROS", "TAGUIG CITY & PATEROS"],
  ["TAPAT", "TAGUIG CITY & PATEROS"],
  ["VALENZUELA", "VALENZUELA"],
  ["VALENZUELA CITY", "VALENZUELA"],
]);

let workbookCache = null;
let datasetCache = null;

const normalizeText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const normalizeUpper = (value) => normalizeText(value).toUpperCase();

const normalizeDivisionName = (value, fallbackSheetName = "") => {
  const normalized = normalizeUpper(value || fallbackSheetName);
  const fallbackNormalized = normalizeUpper(fallbackSheetName);

  if (!normalized) {
    return "";
  }

  if (
    ["METRO MANILA", "NCR", "NATIONAL CAPITAL REGION"].includes(normalized) &&
    NCR_DIVISION_ALIASES.has(fallbackNormalized)
  ) {
    return NCR_DIVISION_ALIASES.get(fallbackNormalized);
  }

  return NCR_DIVISION_ALIASES.get(normalized) || normalized;
};

const normalizeHeaderToken = (value) =>
  normalizeUpper(value)
    .replace(/[().]/g, "")
    .replace(/\//g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const HEADER_PATTERNS = [
  { key: "sequenceNo", match: [/^NO$/] },
  { key: "clcId", match: [/^COMMUNITY LEARNING CENTER CLC ID$/, /^CLC ID$/] },
  { key: "clcName", match: [/^CLC NAME$/] },
  { key: "clcType", match: [/^CLC TYPE$/] },
  { key: "clcLocation", match: [/^CLC LOCATION$/] },
  { key: "schoolId", match: [/^SCHOOL ID$/] },
  { key: "schoolName", match: [/^SCHOOL NAME$/] },
  { key: "region", match: [/^REGION$/] },
  { key: "division", match: [/^DIVISION$/] },
  { key: "province", match: [/^PROVINCE$/] },
  { key: "cityMunicipality", match: [/^CITY MUNICIPALITY$/, /^CITY MUNICIPALITY$/] },
  { key: "barangay", match: [/^BARANGAY$/] },
  { key: "clcAddress", match: [/^CLC ADDRESS$/, /^ADDRESS$/] },
  { key: "clcLatitude", match: [/^CLC LATITUDE$/, /^LATITUDE$/] },
  { key: "clcLongitude", match: [/^CLC LONGITUDE$/, /^LONGITUDE$/] },
  {
    key: "transportModes",
    match: [/^MODES OF TRANSPORTATION GOING TO THE CLC$/, /^MODES OF TRANSPORTATION$/],
  },
  { key: "employeeId", match: [/^EMPLOYEE ID$/] },
  { key: "employeeNo", match: [/^EMPLOYEE NO$/] },
  { key: "plantillaCode", match: [/^PLANTILLA CODE$/] },
  { key: "firstName", match: [/^FIRST NAME ALS TEACHER$/, /^FIRST NAME$/] },
  { key: "middleName", match: [/^MIDDLE NAME$/] },
  { key: "lastName", match: [/^LAST NAME$/] },
  { key: "extName", match: [/^EXT NAME$/] },
  { key: "remarksStatus", match: [/^REMARKS STATUS$/, /^REMARKS$/] },
];

const getWorkbookVersion = () => {
  if (!fs.existsSync(CLCSHA_PATH)) {
    throw new Error(`CLCSHA workbook not found at ${CLCSHA_PATH}.`);
  }

  const stats = fs.statSync(CLCSHA_PATH);
  return {
    mtimeMs: stats.mtimeMs,
    size: stats.size,
    lastModified: stats.mtime.toISOString(),
  };
};

const readWorkbook = () => {
  const version = getWorkbookVersion();

  if (
    workbookCache &&
    workbookCache.version.mtimeMs === version.mtimeMs &&
    workbookCache.version.size === version.size
  ) {
    return workbookCache;
  }

  const workbook = xlsx.readFile(CLCSHA_PATH, { cellDates: false });
  workbookCache = {
    workbook,
    version,
  };
  datasetCache = null;
  return workbookCache;
};

const isLikelyHeaderRow = (row = []) => {
  const joined = row.map(normalizeHeaderToken);

  const matchedFields = HEADER_PATTERNS.reduce((count, field) => {
    return joined.some((header) => field.match.some((pattern) => pattern.test(header)))
      ? count + 1
      : count;
  }, 0);

  return matchedFields >= 8;
};

const findHeaderRowIndex = (rows = []) => {
  const scanLimit = Math.min(rows.length, 12);

  for (let index = 0; index < scanLimit; index += 1) {
    if (isLikelyHeaderRow(rows[index])) {
      return index;
    }
  }

  return -1;
};

const buildHeaderMap = (headerRow = []) => {
  const normalizedHeaders = headerRow.map((cell) => normalizeHeaderToken(cell));

  return HEADER_PATTERNS.reduce((map, field) => {
    const foundIndex = normalizedHeaders.findIndex((header) =>
      field.match.some((pattern) => pattern.test(header))
    );

    if (foundIndex >= 0) {
      map[field.key] = foundIndex;
    }

    return map;
  }, {});
};

const getCellValue = (row, headerMap, key) => {
  const columnIndex = headerMap[key];
  if (columnIndex === undefined) {
    return "";
  }

  return row[columnIndex] ?? "";
};

const buildRowValuesObject = (row, headers = []) =>
  headers.reduce((result, header, index) => {
    result[header] = row[index] ?? "";
    return result;
  }, {});

const parseCoordinateValue = (value) => {
  const raw = normalizeText(value);

  if (!raw || /^(N\/A|NA)$/i.test(raw)) {
    return null;
  }

  const simpleMatch = raw.match(/^(-?\d+(?:\.\d+)?)(?:\s*(?:\u00b0|DEG)?\s*([NSEW]))?$/i);
  if (simpleMatch) {
    const numeric = Number(simpleMatch[1]);
    const direction = (simpleMatch[2] || "").toUpperCase();

    if (!Number.isFinite(numeric)) {
      return null;
    }

    if (direction === "S" || direction === "W") {
      return -Math.abs(numeric);
    }

    return numeric;
  }

  const dmsMatch = raw.match(
    /^(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)?\D*(\d+(?:\.\d+)?)?\D*([NSEW])$/i
  );

  if (!dmsMatch) {
    return null;
  }

  const degrees = Number(dmsMatch[1] || 0);
  const minutes = Number(dmsMatch[2] || 0);
  const seconds = Number(dmsMatch[3] || 0);
  const direction = String(dmsMatch[4] || "").toUpperCase();

  if (![degrees, minutes, seconds].every(Number.isFinite)) {
    return null;
  }

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal *= -1;
  }

  return decimal;
};

const buildTeacherName = ({ firstName, middleName, lastName, extName }) =>
  [firstName, middleName, lastName, extName].map(normalizeText).filter(Boolean).join(" ");

const buildLearningSiteKey = (record) =>
  normalizeUpper(
    [
      record.division,
      record.clcId,
      record.schoolId,
      record.clcName,
      record.schoolName,
      record.clcAddress,
    ]
      .filter(Boolean)
      .join("|")
  );

const buildTeacherKey = (record) =>
  normalizeUpper(
    [record.division, record.employeeNo, record.employeeId, record.teacherName]
      .filter(Boolean)
      .join("|")
  );

const buildExactRecordKey = (record) =>
  normalizeUpper(
    [
      record.division,
      record.clcId,
      record.clcName,
      record.clcType,
      record.clcLocation,
      record.schoolId,
      record.schoolName,
      record.region,
      record.province,
      record.cityMunicipality,
      record.barangay,
      record.clcAddress,
      record.transportModes,
      record.employeeId,
      record.employeeNo,
      record.firstName,
      record.middleName,
      record.lastName,
      record.extName,
      record.remarksStatus,
    ]
      .map(normalizeText)
      .join("|")
  );

const isClusterOrDividerRow = (rowValues) => {
  const values = Object.values(rowValues).map(normalizeText).filter(Boolean);

  if (!values.length) {
    return true;
  }

  if (values.length === 1 && /^CLUSTER\s+\d+/i.test(values[0])) {
    return true;
  }

  return false;
};

const parseSheetRecords = (sheetName, rows, headerRowIndex, headerMap, headers) => {
  const divisionFallback = normalizeDivisionName("", sheetName);
  const parsedRows = [];

  for (let index = headerRowIndex + 1; index < rows.length; index += 1) {
    const row = rows[index];
    const values = buildRowValuesObject(row, headers);
    const rowValues = {
      sequenceNo: normalizeText(getCellValue(row, headerMap, "sequenceNo")),
      clcId: normalizeText(getCellValue(row, headerMap, "clcId")),
      clcName: normalizeText(getCellValue(row, headerMap, "clcName")),
      clcType: normalizeText(getCellValue(row, headerMap, "clcType")),
      clcLocation: normalizeText(getCellValue(row, headerMap, "clcLocation")),
      schoolId: normalizeText(getCellValue(row, headerMap, "schoolId")),
      schoolName: normalizeText(getCellValue(row, headerMap, "schoolName")),
      region: normalizeText(getCellValue(row, headerMap, "region")),
      division: normalizeDivisionName(getCellValue(row, headerMap, "division"), divisionFallback),
      province: normalizeText(getCellValue(row, headerMap, "province")),
      cityMunicipality: normalizeText(getCellValue(row, headerMap, "cityMunicipality")),
      barangay: normalizeText(getCellValue(row, headerMap, "barangay")),
      clcAddress: normalizeText(getCellValue(row, headerMap, "clcAddress")),
      transportModes: normalizeText(getCellValue(row, headerMap, "transportModes")),
      employeeId: normalizeText(getCellValue(row, headerMap, "employeeId")),
      employeeNo: normalizeText(getCellValue(row, headerMap, "employeeNo")),
      plantillaCode: normalizeText(getCellValue(row, headerMap, "plantillaCode")),
      firstName: normalizeText(getCellValue(row, headerMap, "firstName")),
      middleName: normalizeText(getCellValue(row, headerMap, "middleName")),
      lastName: normalizeText(getCellValue(row, headerMap, "lastName")),
      extName: normalizeText(getCellValue(row, headerMap, "extName")),
      remarksStatus: normalizeText(getCellValue(row, headerMap, "remarksStatus")),
    };

    rowValues.latitude = parseCoordinateValue(getCellValue(row, headerMap, "clcLatitude"));
    rowValues.longitude = parseCoordinateValue(getCellValue(row, headerMap, "clcLongitude"));
    rowValues.teacherName = buildTeacherName(rowValues);

    if (isClusterOrDividerRow(rowValues)) {
      continue;
    }

    if (
      !rowValues.clcName &&
      !rowValues.schoolName &&
      !rowValues.teacherName &&
      !rowValues.clcAddress
    ) {
      continue;
    }

    const division = rowValues.division || divisionFallback;
    parsedRows.push({
      ...rowValues,
      division,
      values,
      sheetName,
      rowNumber: index + 1,
      exactRecordKey: buildExactRecordKey({ ...rowValues, division }),
      learningSiteKey: buildLearningSiteKey({ ...rowValues, division }),
      teacherKey: buildTeacherKey({ ...rowValues, division }),
    });
  }

  return parsedRows;
};

const buildSheetSummary = (sheetName, rows) => {
  const headerRowIndex = findHeaderRowIndex(rows);

  if (headerRowIndex < 0) {
    return {
      name: sheetName,
      skipped: true,
      reason: "Header row not detected",
      rowCount: rows.length,
      headerRowIndex: -1,
      records: [],
      headers: [],
    };
  }

  const headerRow = rows[headerRowIndex];
  const headers = headerRow.map((cell) => normalizeText(cell));
  const headerMap = buildHeaderMap(headerRow);
  const records = parseSheetRecords(sheetName, rows, headerRowIndex, headerMap, headers);

  return {
    name: sheetName,
    skipped: false,
    rowCount: rows.length,
    headerRowIndex,
    headers,
    records,
  };
};

const readWorksheetRows = (worksheet) =>
  xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });

const buildDataset = () => {
  const { workbook, version } = readWorkbook();

  if (
    datasetCache &&
    datasetCache.version.mtimeMs === version.mtimeMs &&
    datasetCache.version.size === version.size
  ) {
    return datasetCache.value;
  }

  const sheets = workbook.SheetNames.filter((name) => !SKIPPED_SHEETS.has(normalizeUpper(name))).map(
    (sheetName) => buildSheetSummary(sheetName, readWorksheetRows(workbook.Sheets[sheetName]))
  );

  const validSheets = sheets.filter((sheet) => !sheet.skipped);
  const sourceRecords = validSheets.flatMap((sheet) => sheet.records);
  const exactRecordMap = new Map();
  const duplicateGroups = new Map();

  sourceRecords.forEach((record) => {
    const key = record.exactRecordKey || buildExactRecordKey(record);
    if (!exactRecordMap.has(key)) {
      exactRecordMap.set(key, record);
      duplicateGroups.set(key, 1);
      return;
    }

    duplicateGroups.set(key, (duplicateGroups.get(key) || 1) + 1);
  });

  const allRecords = Array.from(exactRecordMap.values());

  const uniqueLearningSites = new Map();
  const uniqueTeachers = new Map();
  const divisions = new Map();

  allRecords.forEach((record) => {
    if (record.learningSiteKey && !uniqueLearningSites.has(record.learningSiteKey)) {
      uniqueLearningSites.set(record.learningSiteKey, record);
    }

    if (record.teacherKey && !uniqueTeachers.has(record.teacherKey)) {
      uniqueTeachers.set(record.teacherKey, record);
    }

    if (record.division) {
      divisions.set(record.division, (divisions.get(record.division) || 0) + 1);
    }
  });

  const summary = {
    sourceFile: path.basename(CLCSHA_PATH),
    lastModified: version.lastModified,
    fileSize: version.size,
    totalSheets: validSheets.length,
    totalRows: allRecords.length,
    sourceRowCount: sourceRecords.length,
    duplicateRowsRemoved: sourceRecords.length - allRecords.length,
    totalLearningSites: uniqueLearningSites.size,
    totalTeachers: uniqueTeachers.size,
    totalDivisions: divisions.size,
    divisions: Array.from(divisions.entries())
      .map(([division, count]) => ({ division, count }))
      .sort(
        (left, right) => right.count - left.count || left.division.localeCompare(right.division)
      ),
    sheets: validSheets.map((sheet) => ({
      name: sheet.name,
      rowCount: sheet.records.length,
      headerRowIndex: sheet.headerRowIndex,
      headers: sheet.headers,
    })),
    skippedSheets: sheets
      .filter((sheet) => sheet.skipped)
      .map((sheet) => ({ name: sheet.name, reason: sheet.reason, rowCount: sheet.rowCount })),
  };

  const value = {
    summary,
    sheets: validSheets,
    records: allRecords,
  };

  datasetCache = {
    version,
    value,
  };

  return value;
};

const compareValues = (left, right, direction) => {
  const multiplier = direction === "desc" ? -1 : 1;
  return (
    String(left ?? "").localeCompare(String(right ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    }) * multiplier
  );
};

const queryClcshaRows = ({
  division = "all",
  sheetName = "all",
  search = "",
  sortBy = "division",
  sortDir = "asc",
  page = 1,
  pageSize = 25,
} = {}) => {
  const dataset = buildDataset();
  const normalizedDivision = normalizeDivisionName(division);
  const normalizedSheet = normalizeUpper(sheetName);
  const normalizedSearch = normalizeUpper(search);

  let rows = dataset.records.filter((record) => {
    const matchesDivision =
      division === "all" || !division ? true : record.division === normalizedDivision;
    const matchesSheet =
      sheetName === "all" || !sheetName ? true : normalizeUpper(record.sheetName) === normalizedSheet;
    const searchText = normalizeUpper(
      [
        record.division,
        record.sheetName,
        record.clcName,
        record.schoolName,
        record.teacherName,
        record.clcAddress,
        record.remarksStatus,
      ]
        .filter(Boolean)
        .join(" ")
    );
    const matchesSearch = normalizedSearch ? searchText.includes(normalizedSearch) : true;

    return matchesDivision && matchesSheet && matchesSearch;
  });

  const safeSortKey = [
    "division",
    "sheetName",
    "clcName",
    "schoolName",
    "teacherName",
    "clcAddress",
    "employeeNo",
  ].includes(sortBy)
    ? sortBy
    : "division";

  rows = rows.sort((left, right) => compareValues(left[safeSortKey], right[safeSortKey], sortDir));

  const safePageSize = Math.min(Math.max(Number(pageSize) || 25, 1), 250);
  const safePage = Math.max(Number(page) || 1, 1);
  const totalRows = rows.length;
  const totalPages = totalRows ? Math.ceil(totalRows / safePageSize) : 0;
  const startIndex = (safePage - 1) * safePageSize;

  return {
    rows: rows.slice(startIndex, startIndex + safePageSize),
    totalRows,
    totalPages,
    page: safePage,
    pageSize: safePageSize,
    filters: {
      division,
      sheetName,
      search,
      sortBy: safeSortKey,
      sortDir,
    },
    options: {
      divisions: dataset.summary.divisions.map((item) => item.division),
      sheets: dataset.summary.sheets.map((item) => item.name),
    },
  };
};

const getClcshaSummary = () => buildDataset().summary;

module.exports = {
  buildClcshaDataset: buildDataset,
  getClcshaSummary,
  queryClcshaRows,
};
