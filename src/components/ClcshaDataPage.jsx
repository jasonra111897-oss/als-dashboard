import React, { useEffect, useMemo, useState } from "react";
import { fetchClcshaRows } from "../services/dataService";
import WorkbookDataWorkbench from "./WorkbookDataWorkbench";
import "./ClcshaDataPage.css";

const normalizeText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const cleanDisplayText = (value) => normalizeText(value).replace(/\bN\/A\b/gi, "").trim();
const isUsefulCategory = (value) => {
  const text = cleanDisplayText(value);
  return text && !/^\d+$/.test(text);
};

const buildCenterName = (row) =>
  cleanDisplayText(row.clcName) ||
  cleanDisplayText(row.schoolName) ||
  cleanDisplayText(row.clcId) ||
  "Community Learning Center";

const buildMapUrl = (center) => {
  const query = [
    center.name,
    center.address,
    center.barangay,
    center.cityMunicipality,
    center.division,
    "Metro Manila",
    "Philippines",
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
};

const buildAddressRecords = (rows = []) => {
  const uniqueCenters = new Map();

  rows.forEach((row) => {
    const division = normalizeText(row.division || row.sheetName);
    const address = normalizeText(row.clcAddress);

    if (!division || !address) {
      return;
    }

    const name = buildCenterName(row);
    const key = [division, name, address].join("|").toUpperCase();

    if (!uniqueCenters.has(key)) {
      const category = [row.clcType, row.clcLocation].find(isUsefulCategory);

      uniqueCenters.set(key, {
        id: key,
        name,
        division,
        address,
        category: cleanDisplayText(category) || "Community Center",
        contact: cleanDisplayText(row.teacherName) || "Not specified",
        barangay: cleanDisplayText(row.barangay),
        cityMunicipality: cleanDisplayText(row.cityMunicipality),
      });
    }
  });

  return Array.from(uniqueCenters.values()).sort(
    (left, right) =>
      left.division.localeCompare(right.division, undefined, { sensitivity: "base" }) ||
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );
};

const CommunityCenterAddressPanel = () => {
  const [centers, setCenters] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadRows = async () => {
      try {
        setIsLoading(true);
        setError("");

        const firstPage = await fetchClcshaRows({ page: 1, pageSize: 250 });
        const totalPages = Math.max(Number(firstPage.totalPages) || 1, 1);
        const nextPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            fetchClcshaRows({ page: index + 2, pageSize: 250 })
          )
        );
        const allRows = [firstPage, ...nextPages].flatMap((payload) => payload.rows || []);

        if (!ignore) {
          setCenters(buildAddressRecords(allRows));
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load community center addresses.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadRows();

    return () => {
      ignore = true;
    };
  }, []);

  const divisionOptions = useMemo(
    () => Array.from(new Set(centers.map((center) => center.division))).sort(),
    [centers]
  );

  const visibleCenters = useMemo(
    () => centers.filter((center) => center.division === selectedDivision),
    [centers, selectedDivision]
  );

  const selectedCenter = useMemo(
    () => visibleCenters.find((center) => center.id === selectedCenterId) || null,
    [selectedCenterId, visibleCenters]
  );

  const handleDivisionChange = (event) => {
    setSelectedDivision(event.target.value);
    setSelectedCenterId("");
  };

  return (
    <section className="clc-address-section">
      <div className="clc-address-layout">
        <div className="clc-address-detail-card">
          <div className="clc-address-filters">
            <label>
              <span>Choose Division</span>
              <select value={selectedDivision} onChange={handleDivisionChange}>
                <option value="">Select a division</option>
                {divisionOptions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Choose Community Center</span>
              <select
                value={selectedCenterId}
                onChange={(event) => setSelectedCenterId(event.target.value)}
                disabled={!selectedDivision}
              >
                <option value="">Select a community center</option>
                {visibleCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <div className="clc-address-message">{error}</div> : null}

          {isLoading ? (
            <div className="clc-address-message">Loading community center addresses...</div>
          ) : selectedCenter ? (
            <div className="clc-address-content">
              <div className="clc-address-heading">
                <h2>{selectedCenter.name}</h2>
                <p>{selectedCenter.address}</p>
              </div>

              <div className="clc-address-card-row">
                <div>
                  <span>Division</span>
                  <strong>{selectedCenter.division}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{selectedCenter.category}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>{selectedCenter.contact}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="clc-address-message">
              Select a division and community center to view its address.
            </div>
          )}
        </div>

        <div className="clc-address-map-card">
          {selectedCenter ? (
            <iframe
              title={`${selectedCenter.name} map`}
              src={buildMapUrl(selectedCenter)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="clc-address-map-placeholder">Map preview</div>
          )}
        </div>
      </div>
    </section>
  );
};

const ClcshaDataPage = ({ onSourcesUpdated }) => (
  <section className="clcsha-page">
    <div className="clcsha-page-hero">
      <div className="clcsha-page-copy">
        <span className="section-kicker">Community Learning Centers</span>
        <h1>Community Learning Centers</h1>
      </div>
    </div>

    <WorkbookDataWorkbench
      onSourcesUpdated={onSourcesUpdated}
      title="Community learning center records"
      description="Browse the uploaded community learning center workbook by division and search across rows."
      sectionKicker="Community Learning Centers"
      lockedSourceId="clcsha"
      showHeader={false}
      showSourceCards={false}
      showSummaryMetrics={false}
      showCombinedAnalytics={false}
      showTopDivisions={false}
      showExportButton={false}
      showExplorerHeader={false}
      showSortControl={false}
    />

    <CommunityCenterAddressPanel />
  </section>
);

export default ClcshaDataPage;
