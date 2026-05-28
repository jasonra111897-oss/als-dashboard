import React, { useMemo, useState } from "react";
import "./NCRMapModal.css";

const DIVISION_ADDRESSES = {
  CALOOCAN: "10th Ave., Kalookan HS, Caloocan City, Metro Manila, Philippines",
  "LAS PI\u00d1AS":
    "Gabaldon Bldg., Padre Diego Cera Ave., Las Pi\u00f1as City, Metro Manila, Philippines",
  MAKATI: "Gov. Noble St., Brgy. Guadalupe Nuevo, Makati City, Metro Manila, Philippines",
  MALABON: "Maya-maya St., Kaunlaran Village, Longos, Malabon City, Metro Manila, Philippines",
  MANDALUYONG:
    "Highway Hills Elementary School, Calbayog St., Mandaluyong City, Metro Manila, Philippines",
  MANILA: "Antonio J. Villegas St., Ermita, Manila, Metro Manila, Philippines",
  MARIKINA: "Shoe Ave., Sta. Elena, Marikina City, Metro Manila, Philippines",
  MUNTINLUPA:
    "Laguerta St., Tensuan Site, Poblacion, Muntinlupa City, Metro Manila, Philippines",
  NAVOTAS:
    "Bagumbayan Elementary School Compound, M. Naval St., Sipac-Almacen, Navotas City, Metro Manila, Philippines",
  PARA\u00d1AQUE:
    "Kabihasnan St., Brgy. San Dionisio, Para\u00f1aque City, Metro Manila, Philippines",
  PASAY: "P. Zamora St., Pasay City, Metro Manila, Philippines",
  PASIG: "Pasig Elementary School, Caruncho Ave., Pasig City, Metro Manila, Philippines",
  "QUEZON CITY": "Nueva Ecija St., Bago Bantay, Quezon City, Metro Manila, Philippines",
  "SAN JUAN": "Pinaglabanan St., San Juan City, Metro Manila, Philippines",
  "TAGUIG CITY & PATEROS":
    "Gen. Santos Ave., Central Bicutan, Taguig City, Metro Manila, Philippines",
  VALENZUELA: "P. Valenzuela St., Marulas, Valenzuela City, Metro Manila, Philippines",
};

const NCRMapModal = ({
  isOpen,
  onClose,
  divisions,
  currentDivision,
  inlineMode = false,
}) => {
  const [selectedDivisionName, setSelectedDivisionName] = useState(currentDivision || "");

  const selectedDivision =
    divisions.find((division) => division.division === (selectedDivisionName || currentDivision)) ||
    null;

  const selectedAddress = selectedDivision
    ? DIVISION_ADDRESSES[selectedDivision.division] ||
      `${selectedDivision.division}, Metro Manila, Philippines`
    : "";

  const embeddedMapUrl = useMemo(() => {
    if (!selectedAddress) {
      return "";
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(selectedAddress)}&z=16&output=embed`;
  }, [selectedAddress]);

  if (!isOpen) {
    return null;
  }

  const content = (
      <div
        className={`map-modal division-map-modal ${inlineMode ? "map-modal-inline" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <section className="division-map-hero">
          <div className="division-map-hero-copy">
            <span className="section-kicker section-kicker-light">NCR Division Map</span>
            <h2>NCR Division Office Map</h2>
            <p>
              Select a division to view its office location, regional coverage details, and embedded
              map preview.
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

        <div className="map-layout">
          <aside className="map-detail-card">
            <div className="map-division-select-shell">
              <label htmlFor="division-map-select">Choose Division</label>
              <select
                id="division-map-select"
                className="map-division-select"
                value={selectedDivisionName}
                onChange={(event) => setSelectedDivisionName(event.target.value)}
              >
                <option value="">Select a division office</option>
                {divisions.map((division) => (
                  <option key={division.division} value={division.division}>
                    {division.division}
                  </option>
                ))}
              </select>
            </div>

            {selectedDivision ? (
              <>
                <h3>{selectedDivision.division}</h3>
                <p className="map-detail-address">{selectedAddress}</p>

                <div className="map-detail-stats">
                  <div className="map-detail-stat">
                    <span>Schools</span>
                    <strong>{selectedDivision.totalSchools}</strong>
                  </div>
                  <div className="map-detail-stat">
                    <span>Implementers</span>
                    <strong>{selectedDivision.totalImplementers}</strong>
                  </div>
                  <div className="map-detail-stat">
                    <span>Status</span>
                    <strong>Active</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="map-selection-empty">
                <h3>Select a division</h3>
                <p>Office details and the map preview will appear after choosing a division.</p>
              </div>
            )}
          </aside>

          <div className="map-canvas-card">
            {embeddedMapUrl ? (
              <iframe
                title={`${selectedDivision?.division || "NCR Division"} office map`}
                className="map-iframe"
                src={embeddedMapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="map-iframe-empty">Choose a division to load its office map.</div>
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

export default NCRMapModal;
