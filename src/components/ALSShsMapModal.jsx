import React, { useMemo, useState } from "react";
import "./ALSShsMapModal.css";

const CATEGORY_ORDER = ["All", "Junior High School", "High School", "Senior High School"];

const normalizeMapText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const parseCoordinate = (value) => {
  const normalized = normalizeMapText(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildSchoolMapUrl = (school) => {
  const latitude = parseCoordinate(school?.latitude);
  const longitude = parseCoordinate(school?.longitude);

  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;
  }

  const query = [
    normalizeMapText(school?.schoolName),
    normalizeMapText(school?.schoolAddress),
    normalizeMapText(school?.division),
    "Metro Manila",
    "Philippines",
  ]
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .join(", ");

  if (!query) {
    return "";
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
};

const ALSShsMapModal = ({
  isOpen,
  onClose,
  currentDivision,
  divisions,
  schoolsData,
  isLoading,
  error,
  inlineMode = false,
}) => {
  const allSchoolRows = useMemo(
    () =>
      [...(schoolsData?.schools || [])].sort(
        (left, right) =>
          String(left.division || "").localeCompare(String(right.division || "")) ||
          String(left.schoolName || "").localeCompare(String(right.schoolName || ""))
      ),
    [schoolsData]
  );

  const divisionNames = useMemo(() => {
    const names = [
      ...(Array.isArray(divisions)
        ? divisions.map((division) => division.division).filter(Boolean)
        : []),
      ...allSchoolRows.map((school) => school.division).filter(Boolean),
    ];

    return [...new Set(names)].sort((left, right) => String(left).localeCompare(String(right)));
  }, [allSchoolRows, divisions]);

  const defaultDivision =
    currentDivision && divisionNames.includes(currentDivision) ? currentDivision : "";
  const [selectedDivisionName, setSelectedDivisionName] = useState(defaultDivision);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  const divisionSchools = useMemo(
    () => allSchoolRows.filter((school) => school.division === selectedDivisionName),
    [allSchoolRows, selectedDivisionName]
  );

  const availableCategories = useMemo(() => {
    const categories = [
      ...new Set(divisionSchools.map((school) => normalizeMapText(school.category)).filter(Boolean)),
    ];

    return CATEGORY_ORDER.filter(
      (category) => category === "All" || categories.includes(category)
    );
  }, [divisionSchools]);

  const visibleSchools = useMemo(
    () =>
      selectedCategory === "All"
        ? divisionSchools
        : divisionSchools.filter((school) => normalizeMapText(school.category) === selectedCategory),
    [divisionSchools, selectedCategory]
  );

  const selectedSchool =
    visibleSchools.find((school) => String(school.schoolId) === String(selectedSchoolId)) || null;

  const embeddedMapUrl = selectedSchool ? buildSchoolMapUrl(selectedSchool) : "";

  const handleDivisionChange = (divisionName) => {
    setSelectedDivisionName(divisionName);
    setSelectedCategory("All");
    setSelectedSchoolId("");
  };

  if (!isOpen) {
    return null;
  }

  const content = (
    <div
      className={`map-modal school-map-modal ${inlineMode ? "map-modal-inline school-map-modal-inline" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <section className="school-map-hero">
        <div className="school-map-hero-copy">
          <span className="section-kicker section-kicker-light">ALS Schools Map</span>
          <h2>ALS Schools Map</h2>
          <p>
            Choose a division, then select an ALS school to view its site details and embedded map
            preview.
          </p>
        </div>

        {!inlineMode ? (
          <button
            type="button"
            className="map-modal-button map-modal-button-primary"
            onClick={onClose}
          >
            Back to Dashboard
          </button>
        ) : null}
      </section>

      <div className="school-map-layout">
        <aside className="map-detail-card school-map-detail-card">
          <div className="school-map-select-grid">
            <div className="map-division-select-shell">
              <label htmlFor="als-school-division-select">Choose Division</label>
              <select
                id="als-school-division-select"
                className="map-division-select"
                value={selectedDivisionName}
                onChange={(event) => handleDivisionChange(event.target.value)}
              >
                <option value="">Select a division</option>
                {divisionNames.map((divisionName) => (
                  <option key={divisionName} value={divisionName}>
                    {divisionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-division-select-shell">
              <label htmlFor="als-school-category-select">Choose Category</label>
              <select
                id="als-school-category-select"
                className="map-division-select"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setSelectedSchoolId("");
                }}
                disabled={!selectedDivisionName || isLoading || Boolean(error)}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Schools" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-division-select-shell">
              <label htmlFor="als-school-select">Choose School</label>
              <select
                id="als-school-select"
                className="map-division-select"
                value={selectedSchoolId}
                onChange={(event) => setSelectedSchoolId(event.target.value)}
                disabled={!selectedDivisionName || isLoading || Boolean(error) || !visibleSchools.length}
              >
                <option value="">
                  {selectedDivisionName ? "Select an ALS school" : "Select a division first"}
                </option>
                {visibleSchools.map((school) => (
                  <option key={school.schoolId} value={school.schoolId}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="map-selection-empty">
              <h3>Loading schools</h3>
              <p>Preparing the ALS school directory from the workbook.</p>
            </div>
          ) : error ? (
            <div className="map-selection-empty">
              <h3>Schools unavailable</h3>
              <p>{error}</p>
            </div>
          ) : selectedSchool ? (
            <>
              <h3>{selectedSchool.schoolName}</h3>
              <p className="map-detail-address">
                {selectedSchool.schoolAddress || "Address not yet provided."}
              </p>

              <div className="school-map-detail-stats">
                <div className="map-detail-stat">
                  <span>Category</span>
                  <strong>{selectedSchool.category || "Unspecified"}</strong>
                </div>
                <div className="map-detail-stat">
                  <span>Contact</span>
                  <strong>{selectedSchool.contactNumber || "No contact listed"}</strong>
                </div>
                <div className="map-detail-stat">
                  <span>Division</span>
                  <strong>{selectedDivisionName}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="map-selection-empty">
              <h3>{selectedDivisionName ? "Select a school" : "Select a division"}</h3>
              <p>
                {selectedDivisionName
                  ? "School details and the map preview will appear after choosing a category and school."
                  : "Start with a division, then choose a category and ALS school from that division."}
              </p>
            </div>
          )}
        </aside>

        <div className="map-canvas-card school-map-canvas-card">
          {selectedSchool && embeddedMapUrl ? (
            <iframe
              title={`${selectedSchool.schoolName} map`}
              key={selectedSchool.schoolId}
              className="map-iframe"
              src={embeddedMapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="map-iframe-empty">
              {selectedDivisionName
                ? "Choose a school to load its map."
                : "Choose a division and school to load the map."}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (inlineMode) {
    return content;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
};

export default ALSShsMapModal;
