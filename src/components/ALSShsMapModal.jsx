import React, { useMemo, useState } from "react";
import "./ALSShsMapModal.css";

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

const getDivisionInitials = (divisionName) =>
  String(divisionName || "")
    .split(/[\s&]+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3);

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
  inlineMode = false,
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
      ...(Array.isArray(divisions)
        ? divisions.map((division) => division.division).filter(Boolean)
        : []),
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

  const activeDivisionName =
    selectedDivisionName ||
    (currentDivision && divisionNames.includes(currentDivision) ? currentDivision : "");

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
    () => filteredSchools.filter((school) => school.division === activeDivisionName),
    [activeDivisionName, filteredSchools]
  );

  const categoryCounts = useMemo(
    () =>
      availableCategories.reduce((accumulator, category) => {
        accumulator[category] =
          category === "All"
            ? allSchoolRows.filter((school) => school.division === activeDivisionName).length
            : allSchoolRows.filter(
                (school) =>
                  school.division === activeDivisionName &&
                  String(school.category || "").trim() === category
              ).length;
        return accumulator;
      }, {}),
    [activeDivisionName, allSchoolRows, availableCategories]
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

  const selectedDivisionLogo = activeDivisionName ? getDivisionLogoSrc(activeDivisionName) : "";
  const selectedDivisionOfficeTitle = activeDivisionName
    ? getDivisionOfficeTitle(activeDivisionName)
    : "";
  const embeddedMapUrl = selectedSchool ? buildSchoolMapUrl(selectedSchool) : "";
  const googleMapsUrl = selectedSchool ? buildOpenMapsUrl(selectedSchool) : "";

  const selectDivision = (divisionName) => {
    setSelectedDivisionName(divisionName);
    setSelectedCategory("All");
    setSchoolSearchTerm("");
    setSelectedSchoolId(null);
  };

  const clearDivisionSelection = () => {
    setSelectedDivisionName("");
    setSelectedCategory("All");
    setSchoolSearchTerm("");
    setSelectedSchoolId(null);
  };

  if (!isOpen) {
    return null;
  }

  const content = (
      <div
        className={`map-modal shs-map-modal ${inlineMode ? "map-modal-inline shs-map-modal-inline" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header map-modal-header">
          <div className="map-modal-header-copy">
            <span className="section-kicker">Live School Locator</span>
            <h2>ALS Schools Map</h2>
            <div className="map-modal-header-pills">
              <span className="map-modal-header-pill">
                <strong>{divisionNames.length}</strong>
                <span>Divisions</span>
              </span>
              <span className="map-modal-header-pill">
                <strong>{allSchoolRows.length}</strong>
                <span>Mapped Schools</span>
              </span>
              <span className="map-modal-header-pill">
                <strong>{activeDivisionName || "Regional"}</strong>
                <span>{activeDivisionName ? "Active Division" : "Current Scope"}</span>
              </span>
            </div>
          </div>

          <div className="map-modal-actions">
            <button
              type="button"
              className="map-modal-button map-modal-button-secondary map-modal-icon-button"
              onClick={onHomeClick}
              aria-label="Go to Regional Home"
              title="Regional Home"
            >
              <img src="/home.webp" alt="" className="map-modal-icon-image" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="shs-map-layout shs-map-layout-live">
          <aside className="map-detail-card shs-map-sidebar shs-map-sidebar-live">
            <div className="shs-browser-header shs-browser-header-live">
              {activeDivisionName ? (
                <div className="shs-inline-office-header shs-inline-office-header-primary">
                  <div className="division-office-header">
                    <div className="division-office-logo-shell">
                      {selectedDivisionLogo ? (
                        <img
                          src={selectedDivisionLogo}
                          alt={`${activeDivisionName} division logo`}
                          className="division-office-logo"
                        />
                      ) : (
                        <span className="division-office-logo-fallback">
                          {getDivisionInitials(activeDivisionName)}
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
              ) : (
                <div className="shs-browser-copy">
                  <span className="section-kicker">Division Directory</span>
                  <h3>Choose an NCR division</h3>
                  <p>
                    Select a division to load its ALS schools and view each site on the live map.
                  </p>
                </div>
              )}

              <div className="shs-map-summary-pills shs-map-summary-pills-browser">
                <span>{divisionNames.length} divisions</span>
                <span>{allSchoolRows.length} mapped school rows</span>
                <span>
                  {activeDivisionName
                    ? `${searchedSchools.length || visibleSchools.length} visible school(s)`
                    : "Choose a division"}
                </span>
              </div>
            </div>

            {!activeDivisionName ? (
              <div className="shs-panel-section shs-panel-section-divisions">
                <div className="shs-panel-heading shs-panel-heading-browser">
                  <span className="section-kicker">Divisions</span>
                  <p>Pick a division to load its schools directory and map view.</p>
                </div>

                <div className="shs-directory-grid">
                  {divisionNames.map((divisionName) => (
                    <button
                      key={divisionName}
                      type="button"
                      className={`shs-directory-card ${
                        activeDivisionName === divisionName ? "active" : ""
                      }`}
                      onClick={() => selectDivision(divisionName)}
                    >
                      <strong>{divisionName}</strong>
                      <span>{divisionSchoolCounts[divisionName] || 0} school site(s)</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeDivisionName ? (
              <div className="shs-panel-section shs-panel-section-schools">
                <div className="shs-switch-row">
                  <select
                    id="shs-division-switch"
                    className="shs-division-select"
                    value={activeDivisionName}
                    onChange={(event) => {
                      selectDivision(event.target.value);
                      onSelectDivision?.(event.target.value);
                    }}
                  >
                    {divisionNames.map((divisionName) => (
                      <option key={divisionName} value={divisionName}>
                        {divisionName}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="map-modal-button map-modal-button-secondary shs-reset-button"
                    onClick={clearDivisionSelection}
                  >
                    Show All Divisions
                  </button>
                </div>

                <select
                  className="shs-category-select"
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setSelectedSchoolId(null);
                    setSchoolSearchTerm("");
                  }}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === "All" ? "All Schools" : category} ({categoryCounts[category] || 0})
                    </option>
                  ))}
                </select>

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

                <select
                  className="shs-school-select"
                  value={selectedSchool?.schoolId || ""}
                  onChange={(event) => setSelectedSchoolId(event.target.value || null)}
                  disabled={!searchedSchools.length}
                >
                  {searchedSchools.length ? (
                    searchedSchools.map((school) => (
                      <option key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </option>
                    ))
                  ) : (
                    <option value="">No schools available</option>
                  )}
                </select>

                <div className="shs-panel-heading shs-panel-heading-browser">
                  <span className="section-kicker">School List</span>
                  <p>
                    {searchedSchools.length} school(s) shown for {activeDivisionName}.
                  </p>
                </div>

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
            ) : null}
          </aside>

          <div className="map-canvas-card shs-map-canvas-card shs-map-canvas-card-live">
            {activeDivisionName && selectedSchool ? (
              <>
                <div className="shs-map-school-header">
                  <span className="section-kicker">Selected School</span>
                  <h3>{selectedSchool.schoolName}</h3>
                  <p className="shs-map-school-meta">{selectedSchool.category || "Unspecified"}</p>
                  <div className="shs-map-school-data">
                    <div className="shs-map-school-data-card">
                      <span>Address</span>
                      <strong>{selectedSchool.schoolAddress || "Address not yet provided."}</strong>
                    </div>
                    <div className="shs-map-school-data-card">
                      <span>Contact Number</span>
                      <strong>{selectedSchool.contactNumber || "No contact number listed"}</strong>
                    </div>
                    <div className="shs-map-school-data-card">
                      <span>Division</span>
                      <strong>{activeDivisionName}</strong>
                    </div>
                  </div>
                  <div className="map-detail-actions">
                    <a className="map-open-link" href={googleMapsUrl} target="_blank" rel="noreferrer">
                      Open in Google Maps
                    </a>
                    <button
                      type="button"
                      className="map-modal-button map-modal-button-primary"
                      onClick={() => {
                        onSelectDivision?.(activeDivisionName);
                        onClose();
                      }}
                    >
                      Open {activeDivisionName}
                    </button>
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
              <div className="shs-map-empty-state">
                <span className="section-kicker">Live Map</span>
                <h3>
                  {activeDivisionName
                    ? `Choose a school in ${activeDivisionName}`
                    : "Choose a division to begin"}
                </h3>
                <p>
                  {activeDivisionName
                    ? "The school list is ready on the left. Click any school and its exact map location will appear here."
                    : "Start with the division directory on the left. Once you pick a division, its school list and live map view will load here."}
                </p>
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
