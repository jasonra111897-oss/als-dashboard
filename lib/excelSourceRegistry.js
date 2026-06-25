const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const {
  buildClcshaDataset,
  clearClcshaCaches,
  validateClcshaWorkbookBuffer,
} = require("./clcshaWorkbook");

const PROJECT_ROOT = path.join(__dirname, "..");
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const SOURCE_DEFINITIONS = [
  {
    id: "primary",
    label: "Primary ALS Dataset",
    fileName: "data.xlsx",
    description: "Core ALS dashboard workbook with divisions, teachers, schools, and enrolment.",
  },
  {
    id: "clcsha",
    label: "CLCSHA NCR Dataset",
    fileName: "CLCSHA DB_NCR.xlsx",
    description:
      "Community Learning Center and teacher assignment workbook with per-division assignment sheets.",
  },
];

const sourceCache = new Map();
let combinedCache = null;

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const normalizeUpper = (value) => normalizeText(value).toUpperCase();

const hasMeaningfulValue = (value) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === "string" && normalizeText(value) === "");

const isRowMeaningful = (row = []) => row.some((cell) => hasMeaningfulValue(cell));

const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveSourceDefinition = (sourceId) => {
  const source = SOURCE_DEFINITIONS.find((item) => item.id === sourceId);

  if (!source) {
    throw new Error(`Unknown data source "${sourceId}".`);
  }

  return source;
};

const getSourceFilePath = (sourceId) =>
  path.join(PROJECT_ROOT, resolveSourceDefinition(sourceId).fileName);

const ensureValidUpload = (fileName, buffer) => {
  if (!/\.xlsx$/i.test(String(fileName || "").trim())) {
    throw new Error("Only .xlsx files are supported.");
  }

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error(`Uploaded file exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit.`);
  }

  const zipSignature = buffer.subarray(0, 4).toString("binary");
  if (zipSignature !== "PK\u0003\u0004" && zipSignature !== "PK\u0005\u0006" && zipSignature !== "PK\u0007\u0008") {
    throw new Error("Uploaded file does not look like a valid Excel workbook.");
  }
};

const validatePrimaryWorkbookBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const normalizedSheetNames = workbook.SheetNames.map((name) => normalizeUpper(name));
  const requiredSheets = ["DIVISIONS", "TEACHERS", "SCHOOLS", "ENROLMENT"];
  const missingSheets = requiredSheets.filter((sheetName) => !normalizedSheetNames.includes(sheetName));

  if (missingSheets.length) {
    throw new Error(
      `Primary ALS workbook is missing required sheet(s): ${missingSheets.join(", ")}.`
    );
  }

  return workbook;
};

const validateSourceBuffer = (sourceId, buffer) => {
  if (sourceId === "clcsha") {
    return validateClcshaWorkbookBuffer(buffer);
  }

  return validatePrimaryWorkbookBuffer(buffer);
};

const scoreHeaderRow = (row = [], rowIndex, rows) => {
  if (!row.length) {
    return -1;
  }

  const nonEmpty = row.filter((cell) => normalizeText(cell)).length;
  if (nonEmpty < 2) {
    return -1;
  }

  const keywordMatches = row.reduce((count, cell) => {
    const value = normalizeUpper(cell);
    return /ID|NAME|DIVISION|SCHOOL|TEACHER|CLC|ADDRESS|CATEGORY|EMPLOYEE|REGION|BARANGAY|LATITUDE|LONGITUDE|CONTACT|TOTAL|PROGRAM|POSITION|ENROLL/i.test(
      value
    )
      ? count + 1
      : count;
  }, 0);

  const numericLike = row.reduce((count, cell) => {
    const value = normalizeText(cell);
    return value && !Number.isNaN(Number(value)) ? count + 1 : count;
  }, 0);

  const nextRow = rows[rowIndex + 1] || [];
  const nextRowNonEmpty = nextRow.filter((cell) => normalizeText(cell)).length;

  return nonEmpty * 3 + keywordMatches * 5 + Math.min(nextRowNonEmpty, nonEmpty) - numericLike;
};

const detectHeaderRowIndex = (rows = []) => {
  const maxScan = Math.min(rows.length, 20);
  let bestIndex = -1;
  let bestScore = -1;

  for (let index = 0; index < maxScan; index += 1) {
    const score = scoreHeaderRow(rows[index], index, rows);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestScore >= 8 ? bestIndex : -1;
};

const buildHeaders = (row = []) => {
  const seen = new Map();

  return row.map((cell, index) => {
    const rawValue = normalizeText(cell);
    const base = rawValue || `Column ${index + 1}`;
    const currentCount = seen.get(base) || 0;
    seen.set(base, currentCount + 1);
    return currentCount === 0 ? base : `${base} (${currentCount + 1})`;
  });
};

const buildSheetRows = (worksheet) => {
  const matrix = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });

  const headerRowIndex = detectHeaderRowIndex(matrix);

  if (headerRowIndex < 0) {
    return {
      headerRowIndex: -1,
      headers: [],
      rows: [],
    };
  }

  const headers = buildHeaders(matrix[headerRowIndex] || []);
  const rows = matrix
    .slice(headerRowIndex + 1)
    .filter((row) => isRowMeaningful(row))
    .map((row, rowIndex) => {
      const values = headers.reduce((result, header, columnIndex) => {
        result[header] = row[columnIndex] ?? "";
        return result;
      }, {});

      return {
        rowNumber: headerRowIndex + rowIndex + 2,
        values,
      };
    });

  return {
    headerRowIndex,
    headers,
    rows,
  };
};

const detectWorkbookKind = (sheetNames = []) => {
  const normalizedNames = sheetNames.map((name) => normalizeUpper(name));

  if (
    normalizedNames.includes("DIVISIONS") &&
    normalizedNames.includes("TEACHERS") &&
    normalizedNames.includes("SCHOOLS")
  ) {
    return "als-core";
  }

  if (normalizedNames.includes("INSTRUCTIONS")) {
    return "clcsha";
  }

  return "generic";
};

const shouldIndexSheetRecords = (workbookKind, sheetName) => {
  const normalizedSheet = normalizeUpper(sheetName);

  if (workbookKind === "clcsha") {
    return !["INSTRUCTIONS", "SHEET1"].includes(normalizedSheet);
  }

  return true;
};

const findFieldValue = (values, matchers) => {
  const keys = Object.keys(values || {});
  const matcherList = Array.isArray(matchers) ? matchers : [matchers];

  const matchedKey = keys.find((key) =>
    matcherList.some((matcher) => matcher.test(String(key || "")))
  );

  return matchedKey ? values[matchedKey] : "";
};

const buildTeacherName = (values) => {
  const directName = normalizeText(findFieldValue(values, [/^name$/i, /^teacher name$/i]));
  if (directName) {
    return directName;
  }

  const firstName = normalizeText(findFieldValue(values, [/^first name/i, /\(ALS Teacher\)/i]));
  const middleName = normalizeText(findFieldValue(values, [/^middle name/i]));
  const lastName = normalizeText(findFieldValue(values, [/^last name/i]));
  const extName = normalizeText(findFieldValue(values, [/^ext name/i]));

  return [lastName, firstName, middleName, extName].filter(Boolean).join(", ");
};

const inferDivisionFromSheet = (sheetName, workbookKind) => {
  const normalizedSheet = normalizeUpper(sheetName);

  if (workbookKind === "clcsha") {
    if (["INSTRUCTIONS", "SHEET1"].includes(normalizedSheet)) {
      return "";
    }

    if (normalizedSheet === "TAPAT") {
      return "TAGUIG CITY & PATEROS";
    }

    if (normalizedSheet === "LAS PINAS") {
      return "LAS PIÑAS";
    }

    return normalizedSheet;
  }

  return "";
};

const buildEntityContext = (source, sheetName, values) => {
  let division =
    normalizeUpper(findFieldValue(values, [/^division$/i, /division name/i])) ||
    inferDivisionFromSheet(sheetName, source.workbookKind);

  if (division === "TAPAT") {
    division = "TAGUIG CITY & PATEROS";
  } else if (division === "LAS PINAS") {
    division = "LAS PIÑAS";
  }
  const schoolName = normalizeText(
    findFieldValue(values, [/^school name$/i, /school_name/i, /^school$/i])
  );
  const clcName = normalizeText(findFieldValue(values, [/^CLC Name$/i, /Community Learning Center/i]));
  const teacherName = buildTeacherName(values);
  const category = normalizeText(findFieldValue(values, [/^category$/i, /^CLC Type$/i, /program/i]));
  const address = normalizeText(
    findFieldValue(values, [/school address/i, /^CLC Address$/i, /^address$/i, /^CLC Location$/i, /location/i])
  );
  const contactNumber = normalizeText(findFieldValue(values, [/contact/i, /phone/i, /mobile/i, /telephone/i]));
  const latitude = safeNumber(findFieldValue(values, [/latitude/i]));
  const longitude = safeNumber(findFieldValue(values, [/longitude/i]));
  const employeeNumber = normalizeText(findFieldValue(values, [/employee no/i, /employee id/i]));

  let entityType = "Row Record";
  if (teacherName && (schoolName || clcName)) {
    entityType = "Teacher Assignment";
  } else if (schoolName || clcName) {
    entityType = "Learning Site";
  } else if (teacherName) {
    entityType = "Personnel";
  }

  return {
    division,
    schoolName: schoolName || clcName,
    teacherName,
    category,
    address,
    contactNumber,
    latitude,
    longitude,
    employeeNumber,
    entityType,
  };
};

const buildFingerprint = (record) => {
  if (record.entityType === "Teacher Assignment") {
    return normalizeUpper(
      [record.division, record.teacherName, record.schoolName, record.employeeNumber].filter(Boolean).join("|")
    );
  }

  if (record.entityType === "Learning Site") {
    return normalizeUpper([record.division, record.schoolName, record.address].filter(Boolean).join("|"));
  }

  if (record.entityType === "Personnel") {
    return normalizeUpper([record.division, record.teacherName, record.employeeNumber].filter(Boolean).join("|"));
  }

  return normalizeUpper(JSON.stringify(record.values || {}));
};

const buildNormalizedRecord = (source, sheet, row) => {
  const context = buildEntityContext(source, sheet.name, row.values);

  const record = {
    recordId: `${source.id}:${sheet.name}:${row.rowNumber}`,
    sourceId: source.id,
    sourceLabel: source.label,
    sourceFileName: source.fileName,
    workbookKind: source.workbookKind,
    sheetName: sheet.name,
    rowNumber: row.rowNumber,
    ...context,
    values: row.values,
  };

  record.fingerprint = buildFingerprint(record);
  record.searchText = normalizeUpper(
    [
      record.sourceLabel,
      record.sheetName,
      record.division,
      record.schoolName,
      record.teacherName,
      record.category,
      record.address,
      record.contactNumber,
      ...Object.values(record.values || {}),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return record;
};

const serializeSourceSummary = (source) => ({
  id: source.id,
  label: source.label,
  fileName: source.fileName,
  description: source.description,
  workbookKind: source.workbookKind,
  status: source.status,
  error: source.error || "",
  sheetCount: source.sheetCount || 0,
  totalRows: source.totalRows || 0,
  parsedRecordCount: source.parsedRecordCount || 0,
  dedupedRecordCount: source.dedupedRecordCount || 0,
  fileSize: source.fileSize || 0,
  lastModified: source.lastModified || null,
  sheets: (source.sheets || []).map((sheet) => ({
    name: sheet.name,
    rowCount: sheet.rowCount,
    headers: sheet.headers,
  })),
});

const buildClcshaRegistryRecord = (definition, record) => {
  const schoolName = normalizeText(record.schoolName || record.clcName);
  const teacherName = normalizeText(record.teacherName);
  const employeeNumber = normalizeText(record.employeeNo || record.employeeId);
  let entityType = "Row Record";

  if (teacherName && schoolName) {
    entityType = "Teacher Assignment";
  } else if (schoolName) {
    entityType = "Learning Site";
  } else if (teacherName) {
    entityType = "Personnel";
  }

  let fingerprint = normalizeUpper(
    [record.division, schoolName, teacherName, employeeNumber, record.rowNumber]
      .filter(Boolean)
      .join("|")
  );

  if (entityType === "Teacher Assignment") {
    fingerprint = normalizeUpper(
      [record.division, teacherName, schoolName, employeeNumber, normalizeText(record.clcAddress || record.clcLocation)]
        .filter(Boolean)
        .join("|")
    );
  } else if (entityType === "Learning Site") {
    fingerprint =
      record.learningSiteKey ||
      normalizeUpper(
        [record.division, schoolName, normalizeText(record.clcAddress || record.clcLocation)]
          .filter(Boolean)
          .join("|")
      );
  } else if (entityType === "Personnel") {
    fingerprint =
      record.teacherKey ||
      normalizeUpper([record.division, teacherName, employeeNumber].filter(Boolean).join("|"));
  }

  return {
    recordId: `${definition.id}:${record.sheetName}:${record.rowNumber}`,
    sourceId: definition.id,
    sourceLabel: definition.label,
    sourceFileName: definition.fileName,
    workbookKind: "clcsha",
    sheetName: record.sheetName,
    rowNumber: record.rowNumber,
    division: record.division,
    schoolName,
    teacherName,
    category: normalizeText(record.clcType),
    address: normalizeText(record.clcAddress || record.clcLocation),
    contactNumber: "",
    latitude: record.latitude,
    longitude: record.longitude,
    employeeNumber,
    entityType,
    values: record.values || {},
    fingerprint,
    searchText: normalizeUpper(
      [
        definition.label,
        record.sheetName,
        record.division,
        schoolName,
        teacherName,
        record.clcType,
        record.clcAddress,
        record.clcLocation,
        record.remarksStatus,
        ...Object.values(record.values || {}),
      ]
        .filter(Boolean)
        .join(" ")
    ),
  };
};

const parseClcshaSource = async (definition, stats, cacheKey) => {
  try {
    const dataset = await new Promise((resolve) => {
      setImmediate(() => resolve(buildClcshaDataset()));
    });
    const records = dataset.records.map((record) => buildClcshaRegistryRecord(definition, record));
    const dedupedFingerprints = new Set(records.map((record) => record.fingerprint));
    const parsedSource = {
      ...definition,
      status: "ready",
      workbookKind: "clcsha",
      sheetCount: dataset.summary.totalSheets,
      totalRows: dataset.summary.totalRows,
      parsedRecordCount: records.length,
      dedupedRecordCount: dedupedFingerprints.size,
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString(),
      sheets: dataset.sheets.map((sheet) => ({
        name: sheet.name,
        headerRowIndex: sheet.headerRowIndex,
        headers: sheet.headers,
        rowCount: sheet.records.length,
        previewRows: sheet.records.slice(0, 3).map((record) => record.values || {}),
        rows: [],
      })),
      records,
      error: "",
    };

    sourceCache.set(definition.id, { cacheKey, value: parsedSource });
    combinedCache = null;
    return parsedSource;
  } catch (error) {
    const failedSource = {
      ...definition,
      status: "error",
      workbookKind: "clcsha",
      sheetCount: 0,
      totalRows: 0,
      parsedRecordCount: 0,
      dedupedRecordCount: 0,
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString(),
      sheets: [],
      records: [],
      error: `Unable to parse ${definition.fileName}: ${error.message}`,
    };
    sourceCache.set(definition.id, { cacheKey, value: failedSource });
    combinedCache = null;
    return failedSource;
  }
};

const parseWorkbookSource = async (sourceId) => {
  const definition = resolveSourceDefinition(sourceId);
  const filePath = getSourceFilePath(sourceId);

  if (!fs.existsSync(filePath)) {
    return {
      ...definition,
      status: "missing",
      workbookKind: "unknown",
      sheetCount: 0,
      totalRows: 0,
      parsedRecordCount: 0,
      dedupedRecordCount: 0,
      fileSize: 0,
      lastModified: null,
      sheets: [],
      records: [],
      error: `Workbook not found at ${filePath}.`,
    };
  }

  const stats = await fs.promises.stat(filePath);
  const cacheKey = `${stats.mtimeMs}:${stats.size}`;
  const cached = sourceCache.get(sourceId);

  if (cached?.cacheKey === cacheKey) {
    return cached.value;
  }

  if (sourceId === "clcsha") {
    return parseClcshaSource(definition, stats, cacheKey);
  }

  const buffer = await fs.promises.readFile(filePath);

  let workbook;
  try {
    workbook = await new Promise((resolve) => {
      setImmediate(() => resolve(xlsx.read(buffer, { type: "buffer" })));
    });
  } catch (error) {
    const failedSource = {
      ...definition,
      status: "error",
      workbookKind: "unknown",
      sheetCount: 0,
      totalRows: 0,
      parsedRecordCount: 0,
      dedupedRecordCount: 0,
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString(),
      sheets: [],
      records: [],
      error: `Unable to parse ${definition.fileName}: ${error.message}`,
    };
    sourceCache.set(sourceId, { cacheKey, value: failedSource });
    combinedCache = null;
    return failedSource;
  }

  const workbookKind = detectWorkbookKind(workbook.SheetNames);
  const sheets = workbook.SheetNames.map((sheetName) => {
    const parsedSheet = buildSheetRows(workbook.Sheets[sheetName]);
    return {
      name: sheetName,
      headerRowIndex: parsedSheet.headerRowIndex,
      headers: parsedSheet.headers,
      rowCount: parsedSheet.rows.length,
      previewRows: parsedSheet.rows.slice(0, 3).map((row) => row.values),
      rows: parsedSheet.rows,
    };
  });

  const records = sheets.flatMap((sheet) =>
    shouldIndexSheetRecords(workbookKind, sheet.name)
      ? sheet.rows.map((row) =>
          buildNormalizedRecord(
            {
              ...definition,
              workbookKind,
            },
            sheet,
            row
          )
        )
      : []
  );

  const dedupedFingerprints = new Set(records.map((record) => record.fingerprint));
  const parsedSource = {
    ...definition,
    status: "ready",
    workbookKind,
    sheetCount: sheets.length,
    totalRows: sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
    parsedRecordCount: records.length,
    dedupedRecordCount: dedupedFingerprints.size,
    fileSize: stats.size,
    lastModified: stats.mtime.toISOString(),
    sheets,
    records,
    error: "",
  };

  sourceCache.set(sourceId, { cacheKey, value: parsedSource });
  combinedCache = null;
  return parsedSource;
};

const getAllParsedSources = async () => Promise.all(SOURCE_DEFINITIONS.map((source) => parseWorkbookSource(source.id)));

const buildCombinedSummary = async () => {
  const sources = await getAllParsedSources();
  const readySources = sources.filter((source) => source.status === "ready");
  const combinedCacheKey = readySources
    .map((source) => `${source.id}:${source.lastModified}:${source.fileSize}`)
    .join("|");

  if (combinedCache?.cacheKey === combinedCacheKey) {
    return combinedCache.value;
  }

  const dedupedMap = new Map();
  const divisionCounter = new Map();
  const entityCounter = new Map();

  readySources.forEach((source) => {
    source.records.forEach((record) => {
      if (!dedupedMap.has(record.fingerprint)) {
        dedupedMap.set(record.fingerprint, record);
      }
    });
  });

  for (const record of dedupedMap.values()) {
    if (record.division) {
      divisionCounter.set(record.division, (divisionCounter.get(record.division) || 0) + 1);
    }
    entityCounter.set(record.entityType, (entityCounter.get(record.entityType) || 0) + 1);
  }

  const value = {
    sources: readySources.map(serializeSourceSummary),
    summary: {
      totalSources: sources.length,
      activeSources: readySources.length,
      totalSheets: readySources.reduce((sum, source) => sum + source.sheetCount, 0),
      totalRows: readySources.reduce((sum, source) => sum + source.totalRows, 0),
      dedupedRows: dedupedMap.size,
      entityBreakdown: Array.from(entityCounter.entries())
        .map(([entityType, count]) => ({ entityType, count }))
        .sort((left, right) => right.count - left.count),
      topDivisions: Array.from(divisionCounter.entries())
        .map(([division, count]) => ({ division, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
    },
    dedupedRecords: Array.from(dedupedMap.values()),
  };

  combinedCache = { cacheKey: combinedCacheKey, value };
  return value;
};

const listDataSources = async () => {
  const sources = await getAllParsedSources();
  const combined = await buildCombinedSummary();

  return {
    sources: sources.map(serializeSourceSummary),
    summary: combined.summary,
  };
};

const getDatasetOptions = (sources) =>
  sources.map((source) => ({
    id: source.id,
    label: source.label,
    workbookKind: source.workbookKind,
    sheetCount: source.sheetCount,
    totalRows: source.totalRows,
  }));

const getSheetOptions = (sources) =>
  sources.flatMap((source) =>
    source.sheets.map((sheet) => ({
      sourceId: source.id,
      sheetName: sheet.name,
      label: `${source.label}: ${sheet.name}`,
      rowCount: sheet.rowCount,
    }))
  );

const compareValues = (left, right, direction) => {
  const multiplier = direction === "desc" ? -1 : 1;
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return (leftNumber - rightNumber) * multiplier;
  }

  return String(left || "").localeCompare(String(right || ""), undefined, {
    sensitivity: "base",
    numeric: true,
  }) * multiplier;
};

const buildCombinedDisplayRow = (record) => ({
  _recordId: record.recordId,
  _source: record.sourceLabel,
  _sheet: record.sheetName,
  _division: record.division,
  _entityType: record.entityType,
  _schoolName: record.schoolName,
  _teacherName: record.teacherName,
  _category: record.category,
  _address: record.address,
  _contactNumber: record.contactNumber,
});

const buildDetailedDisplayRow = (record) => ({
  _recordId: record.recordId,
  _source: record.sourceLabel,
  _sheet: record.sheetName,
  _division: record.division,
  _entityType: record.entityType,
  ...record.values,
});

const getColumnLabel = (key) => {
  const predefined = {
    _source: "Dataset",
    _sheet: "Sheet",
    _division: "Division",
    _entityType: "Entity Type",
    _schoolName: "School",
    _teacherName: "Teacher",
    _category: "Category",
    _address: "Address",
    _contactNumber: "Contact Number",
  };

  return predefined[key] || key;
};

const buildColumns = (rows) => {
  const keys = rows.reduce((set, row) => {
    Object.keys(row || {}).forEach((key) => {
      if (key !== "_recordId") {
        set.add(key);
      }
    });
    return set;
  }, new Set());

  return Array.from(keys).map((key) => ({
    key,
    label: getColumnLabel(key),
  }));
};

const queryDatasetRows = async ({
  sourceId = "all",
  sheetName = "all",
  search = "",
  sortBy = "_source",
  sortDir = "asc",
  page = 1,
  pageSize = 20,
  dedupe = true,
}) => {
  const allSources = await getAllParsedSources();
  const readySources = allSources.filter((source) => source.status === "ready");
  const selectedSources =
    sourceId === "all" ? readySources : readySources.filter((source) => source.id === sourceId);

  if (!selectedSources.length) {
    return {
      rows: [],
      columns: [],
      totalRows: 0,
      page,
      pageSize,
      totalPages: 0,
      sourceOptions: getDatasetOptions(readySources),
      sheetOptions: getSheetOptions(readySources),
    };
  }

  const specificSheetRequested = sourceId !== "all" && sheetName !== "all";
  let records = selectedSources.flatMap((source) =>
    source.records.filter((record) => sheetName === "all" || record.sheetName === sheetName)
  );

  if (dedupe && !specificSheetRequested) {
    records = Array.from(
      records.reduce((map, record) => {
        if (!map.has(record.fingerprint)) {
          map.set(record.fingerprint, record);
        }
        return map;
      }, new Map()).values()
    );
  }

  const normalizedSearch = normalizeUpper(search);
  if (normalizedSearch) {
    records = records.filter((record) => record.searchText.includes(normalizedSearch));
  }

  let displayRows = records.map((record) =>
    specificSheetRequested ? buildDetailedDisplayRow(record) : buildCombinedDisplayRow(record)
  );

  const columns = buildColumns(displayRows);
  const safeSortKey = columns.find((column) => column.key === sortBy)?.key || columns[0]?.key || "_source";

  displayRows = displayRows.sort((left, right) =>
    compareValues(left[safeSortKey], right[safeSortKey], sortDir)
  );

  const totalRows = displayRows.length;
  const safePageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const totalPages = totalRows ? Math.ceil(totalRows / safePageSize) : 0;
  const startIndex = (safePage - 1) * safePageSize;
  const pagedRows = displayRows.slice(startIndex, startIndex + safePageSize);

  return {
    rows: pagedRows,
    columns,
    totalRows,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    sourceOptions: getDatasetOptions(readySources),
    sheetOptions: getSheetOptions(selectedSources),
    applied: {
      sourceId,
      sheetName,
      search,
      sortBy: safeSortKey,
      sortDir,
      dedupe: Boolean(dedupe),
    },
  };
};

const escapeCsvValue = (value) => {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
};

const exportDatasetRowsCsv = async (query = {}) => {
  const result = await queryDatasetRows({
    ...query,
    page: 1,
    pageSize: 100000,
  });

  const header = result.columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = result.rows
    .map((row) => result.columns.map((column) => escapeCsvValue(row[column.key])).join(","))
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
};

const uploadDataSourceFile = async ({ sourceId, fileName, fileContentBase64 }) => {
  const source = resolveSourceDefinition(sourceId);
  const buffer = Buffer.from(String(fileContentBase64 || ""), "base64");
  ensureValidUpload(fileName || source.fileName, buffer);
  validateSourceBuffer(sourceId, buffer);

  const targetPath = getSourceFilePath(sourceId);
  const tempPath = `${targetPath}.uploading`;
  const backupPath = `${targetPath}.backup`;
  const targetExists = fs.existsSync(targetPath);

  await fs.promises.writeFile(tempPath, buffer);

  try {
    if (targetExists) {
      if (fs.existsSync(backupPath)) {
        await fs.promises.unlink(backupPath);
      }

      await fs.promises.rename(targetPath, backupPath);
    }

    await fs.promises.rename(tempPath, targetPath);

    if (fs.existsSync(backupPath)) {
      await fs.promises.unlink(backupPath);
    }
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath).catch(() => {});
    }

    if (targetExists && fs.existsSync(backupPath) && !fs.existsSync(targetPath)) {
      await fs.promises.rename(backupPath, targetPath).catch(() => {});
    }

    throw new Error(`Unable to replace ${source.fileName}: ${error.message}`);
  }

  sourceCache.delete(sourceId);
  if (sourceId === "clcsha") {
    clearClcshaCaches();
  }
  combinedCache = null;

  return parseWorkbookSource(sourceId);
};

module.exports = {
  SOURCE_DEFINITIONS,
  listDataSources,
  queryDatasetRows,
  exportDatasetRowsCsv,
  uploadDataSourceFile,
  buildCombinedSummary,
};
