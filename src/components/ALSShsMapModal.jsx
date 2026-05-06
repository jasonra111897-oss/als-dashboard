import React, { useMemo, useState } from "react";

const CATEGORY_ORDER = ["All", "Junior High School", "High School", "Senior High School"];

const getDivisionLogoSrc = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const logoMap = {
    CALOOCAN: "/caloocan.png",
    "LAS PIÑAS": encodeURI("/las piñas.png"),
    MAKATI: "/makati.png",
    MALABON: "/malabon.png",
    MANDALUYONG: "/mandaluyong.png",
    MANILA: "/manila.jpeg",
    MARIKINA: "/marikina.png",
    MUNTINLUPA: "/muntinlupa.png",
    NAVOTAS: "/navotas.png",
    PARAÑAQUE: encodeURI("/parañaque.png"),
    PASAY: "/pasay.png",
    PASIG: "/pasig.png",
    "QUEZON CITY": encodeURI("/quezon city.jpg"),
    "SAN JUAN": encodeURI("/san juan.png"),
    "TAGUIG CITY & PATEROS": encodeURI("/taguig&pateros.jpg"),
    VALENZUELA: "/valenzuela.png",
  };

  return logoMap[normalized] || "";
};

const getDivisionOfficeTitle = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const displayNames = {
    CALOOCAN: "Schools Division Office - Caloocan City",
    "LAS PIÑAS": "Schools Division Office - Las Piñas City",
    MAKATI: "Schools Division Office - Makati City",
    MALABON: "Schools Division Office - Malabon City",
    MANDALUYONG: "Schools Division Office - Mandaluyong City",
    MANILA: "Schools Division Office - Manila",
    MARIKINA: "Schools Division Office - Marikina City",
    MUNTINLUPA: "Schools Division Office - Muntinlupa City",
    NAVOTAS: "Schools Division Office - Navotas City",
    PARAÑAQUE: "Schools Division Office - Parañaque City",
    PASAY: "Schools Division Office - Pasay City",
    PASIG: "Schools Division Office - Pasig City",
    "QUEZON CITY": "Schools Division Office - Quezon City",
    "SAN JUAN": "Schools Division Office - San Juan City",
    "TAGUIG CITY & PATEROS": "Schools Division Office - Taguig City and Pateros",
    VALENZUELA: "Schools Division Office - Valenzuela City",
  };

  return displayNames[normalized] || `Schools Division Office - ${normalized}`;
};

const buildSchoolMapUrl = (school) => {
  const latitude = Number(school?.latitude);
  const longitude = Number(school?.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;
  }

  const query = String(school?.schoolAddress || school?.schoolName || "").trim();
  if (!query) {
    return "";
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
};

const buildOpenMapsUrl = (school) => {
  const latitude = Number(school?.latitude);
  const longitude = Number(school?.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  const query = String(school?.schoolAddress || school?.schoolName || "").trim();
  if (!query) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const ALSShsMapModal = ({
  isOpen,
  onClose,
  onHomeClick,
  currentDivision,
  divisions,
  schoolsData,
  isLoading,
  error,
  onSelectDivision,
}) => {
  const allSchoolRows = useMemo(
    () =>
      (schoolsData?.schools || []).sort(
        (left, right) =>
          String(left.division || "").localeCompare(String(right.division || "")) ||
          String(left.schoolName || "").localeCompare(String(right.schoolName || ""))
      ),
    [schoolsData]
  );

  const divisionNames = useMemo(() => {
    const names = [
      ...(Array.isArray(divisions) ? divisions.map((division) => division.division).filter(Boolean) : []),
      ...allSchoolRows.map((school) => school.division).filter(Boolean),
    ];

    return [...new Set(names)].sort((left, right) => String(left).localeCompare(String(right)));
  }, [allSchoolRows, divisions]);

  const availableCategories = useMemo(() => {
    const workbookCategories = [
      ...new Set(allSchoolRows.map((school) => String(school.category || "").trim()).filter(Boolean)),
    ];

    return CATEGORY_ORDER.filter(
      (category) => category === "All" || workbookCategories.includes(category)
    );
  }, [allSchoolRows]);

  const [selectedDivisionName, setSelectedDivisionName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  const filteredSchools = useMemo(
    () =>
      selectedCategory === "All"
        ? allSchoolRows
        : allSchoolRows.filter((school) => String(school.category || "").trim() === selectedCategory),
    [allSchoolRows, selectedCategory]
  );

  const divisionSchoolCounts = useMemo(
    () =>
      divisionNames.reduce((accumulator, divisionName) => {
        accumulator[divisionName] = filteredSchools.filter(
          (school) => school.division === divisionName
        ).length;
        return accumulator;
      }, {}),
    [divisionNames, filteredSchools]
  );

  const visibleSchools = useMemo(
    () => filteredSchools.filter((school) => school.division === selectedDivisionName),
    [filteredSchools, selectedDivisionName]
  );

  const searchedSchools = useMemo(() => {
    const normalizedSearch = schoolSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return visibleSchools;
    }

    return visibleSchools.filter((school) => {
      const haystack = [
        school.schoolName,
        school.schoolAddress,
        school.category,
        school.contactNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [schoolSearchTerm, visibleSchools]);

  const selectedSchool =
    searchedSchools.find((school) => school.schoolId === selectedSchoolId) ||
    searchedSchools[0] ||
    visibleSchools[0] ||
    null;
  const selectedDivisionLogo = selectedDivisionName ? getDivisionLogoSrc(selectedDivisionName) : "";
  const selectedDivisionOfficeTitle = selectedDivisionName
    ? getDivisionOfficeTitle(selectedDivisionName)
    : "";

  const embeddedMapUrl = selectedSchool ? buildSchoolMapUrl(selectedSchool) : "";
  const googleMapsUrl = selectedSchool ? buildOpenMapsUrl(selectedSchool) : "";

  const openDivisionDetail = (divisionName) => {
    setSelectedDivisionName(divisionName);
    setSelectedSchoolId(null);
    setSchoolSearchTerm("");
  };

  const resetToDivisionPicker = () => {
    setSelectedDivisionName("");
    setSelectedSchoolId(null);
    setSchoolSearchTerm("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="map-modal shs-map-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header map-modal-header">
          <div>
            <h2>ALS Schools Map</h2>
            <p className="map-modal-subtitle">
              Select a division first, then open any ALS school to view its location on a live map.
            </p>
          </div>
          <div className="map-modal-actions">
            <button
              type="button"
              className="map-modal-button map-modal-button-secondary"
              onClick={onHomeClick}
            >
              HOME
            </button>
            <button
              type="button"
              className="map-modal-button map-modal-button-primary"
              onClick={onClose}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {!selectedDivisionName ? (
          <div className="shs-map-landing">
            <div className="map-detail-card shs-map-landing-copy">
              <span className="section-kicker">Step 1</span>
              <h3>Choose one of the 16 NCR divisions</h3>
              <p>
                After you pick a division, a dedicated school page will open showing the list of ALS
                schools for that division. Each school is clickable and will show its location on the
                map.
              </p>
              <div className="shs-map-summary-pills">
                <span>{divisionNames.length} divisions available</span>
                <span>{allSchoolRows.length} school row(s) loaded</span>
                <span>{availableCategories.length - 1} school categories available</span>
              </div>
            </div>

            <div className="map-detail-card shs-landing-grid-card">
              <div className="shs-panel-heading">
                <span className="section-kicker">All Divisions</span>
                <p>Click any division to open its ALS schools page.</p>
              </div>

              <div className="shs-landing-grid">
                {divisionNames.map((divisionName) => (
                  <button
                    key={divisionName}
                    type="button"
                    className={`shs-landing-card ${
                      currentDivision === divisionName ? "recommended" : ""
                    }`}
                    onClick={() => openDivisionDetail(divisionName)}
                  >
                    <span className="shs-landing-card-name">{divisionName}</span>
                    <span className="shs-landing-card-meta">
                      {divisionSchoolCounts[divisionName] || 0} school site(s)
                    </span>
                    <strong>Open schools list</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="shs-map-layout">
            <aside className="map-detail-card shs-map-sidebar">
              <div className="shs-inline-office-header">
                <div className="division-office-header">
                  <div className="division-office-logo-shell">
                    {selectedDivisionLogo ? (
                      <img
                        src={selectedDivisionLogo}
                        alt={`${selectedDivisionName} division logo`}
                        className="division-office-logo"
                      />
                    ) : (
                      <span className="division-office-logo-fallback">
                        {String(selectedDivisionName || "")
                          .split(/[\s&]+/)
                          .map((word) => word.charAt(0))
                          .join("")
                          .slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className="shs-division-office-copy">
                    <p className="division-office-kicker">Republic of the Philippines</p>
                    <div className="division-office-rule" />
                    <h2>{selectedDivisionOfficeTitle}</h2>
                    <p className="division-office-subtitle">Department of Education</p>
                  </div>
                </div>
              </div>

              <div className="shs-map-summary-pills">
                <span>{visibleSchools.length} school(s) in this division</span>
                <span>
                  {selectedCategory === "All" ? "All categories" : selectedCategory}
                </span>
              </div>

              <div className="shs-detail-actions">
                <button
                  type="button"
                  className="map-modal-button map-modal-button-secondary"
                  onClick={resetToDivisionPicker}
                >
                  All 16 Divisions
                </button>
                <button
                  type="button"
                  className="map-modal-button map-modal-button-primary"
                  onClick={() => {
                    onSelectDivision?.(selectedDivisionName);
                    onClose();
                  }}
                >
                  Open {selectedDivisionName}
                </button>
              </div>

              <div className="shs-division-switcher">
                <label htmlFor="shs-division-switch" className="section-kicker">
                  Switch Division
                </label>
                <select
                  id="shs-division-switch"
                  className="shs-division-select"
                  value={selectedDivisionName}
                  onChange={(event) => {
                    openDivisionDetail(event.target.value);
                    onSelectDivision?.(event.target.value);
                  }}
                >
                  {divisionNames.map((divisionName) => (
                    <option key={divisionName} value={divisionName}>
                      {divisionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="shs-panel-section shs-panel-section-schools">
                <div className="shs-panel-heading">
                  <span className="section-kicker">List of Schools</span>
                  <p>
                    {schoolSearchTerm.trim() ? searchedSchools.length : visibleSchools.length} school(s)
                    shown
                  </p>
                </div>

                <div className="shs-category-strip">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`shs-category-chip ${selectedCategory === category ? "active" : ""}`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSchoolId(null);
                        setSchoolSearchTerm("");
                      }}
                    >
                      {category === "All" ? "All Schools" : category}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="shs-school-search"
                  placeholder="Search school name, address, or contact"
                  value={schoolSearchTerm}
                  onChange={(event) => {
                    setSchoolSearchTerm(event.target.value);
                    setSelectedSchoolId(null);
                  }}
                />

                <div className="shs-school-list">
                  {isLoading ? (
                    <p className="map-empty-state">Loading ALS schools...</p>
                  ) : error ? (
                    <p className="map-empty-state">{error}</p>
                  ) : searchedSchools.length ? (
                    searchedSchools.map((school) => (
                      <button
                        key={school.schoolId}
                        type="button"
                        className={`shs-school-card ${
                          selectedSchool?.schoolId === school.schoolId ? "active" : ""
                        }`}
                        onClick={() => setSelectedSchoolId(school.schoolId)}
                      >
                        <strong>{school.schoolName}</strong>
                        <span className="shs-school-category">{school.category || "Unspecified"}</span>
                        <span>{school.schoolAddress || "Address not yet provided"}</span>
                        <small>{school.contactNumber || "No contact number listed"}</small>
                      </button>
                    ))
                  ) : (
                    <p className="map-empty-state">
                      No {selectedCategory === "All" ? "ALS school" : selectedCategory.toLowerCase()} rows
                      match this division and search.
                    </p>
                  )}
                </div>
              </div>
              </aside>

              <div className="map-canvas-card shs-map-canvas-card">
                {selectedSchool ? (
                  <>
                    <div className="shs-map-school-header">
                      <span className="section-kicker">Selected School</span>
                      <h3>{selectedSchool.schoolName}</h3>
                      <p className="shs-map-school-meta">{selectedSchool.category || "Unspecified"}</p>
                      <p>{selectedSchool.schoolAddress || "Address not yet provided."}</p>
                      <div className="map-detail-actions">
                        <a className="map-open-link" href={googleMapsUrl} target="_blank" rel="noreferrer">
                          Open in Google Maps
                        </a>
                      </div>
                    </div>

                    {embeddedMapUrl ? (
                      <iframe
                        title={`${selectedSchool.schoolName} map`}
                        className="map-iframe"
                        src={embeddedMapUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="map-iframe-empty">Map preview is unavailable for this school.</div>
                    )}
                  </>
                ) : (
                  <div className="map-iframe-empty">
                    Select a school from the list to display its location on the map.
                  </div>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ALSShsMapModal;
