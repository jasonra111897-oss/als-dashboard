import React, { useMemo, useState } from "react";

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
  onSelectDivision,
  onHomeClick,
}) => {
  const [selectedDivisionName, setSelectedDivisionName] = useState(currentDivision || "");

  const selectedDivision =
    divisions.find((division) => division.division === (selectedDivisionName || currentDivision)) ||
    divisions[0] ||
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

  const googleMapsUrl = useMemo(() => {
    if (!selectedAddress) {
      return "";
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
  }, [selectedAddress]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header map-modal-header">
          <div>
            <h2>NCR Division Office Map</h2>
            <p className="map-modal-subtitle">
              Select a division to view its office on an embedded map and open the exact location in
              Google Maps.
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

        <div className="map-layout">
          <aside className="map-detail-card">
            {selectedDivision ? (
              <>
                <span className="section-kicker">Selected Division</span>
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
                </div>

                <div className="map-detail-actions">
                  <button
                    type="button"
                    className="map-modal-button map-modal-button-primary"
                    onClick={() => {
                      onSelectDivision(selectedDivision.division);
                      onClose();
                    }}
                  >
                    Open {selectedDivision.division}
                  </button>
                  <a
                    className="map-open-link"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </>
            ) : (
              <p className="map-empty-state">No division data available for the map view.</p>
            )}

            <div className="map-list">
              {divisions.map((division) => (
                <button
                  key={division.division}
                  type="button"
                  className={`map-list-item ${
                    selectedDivision?.division === division.division ? "active" : ""
                  }`}
                  onClick={() => setSelectedDivisionName(division.division)}
                >
                  <span>{division.division}</span>
                  <strong>{division.totalImplementers}</strong>
                </button>
              ))}
            </div>
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
              <div className="map-iframe-empty">Map preview is unavailable for this division.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCRMapModal;
