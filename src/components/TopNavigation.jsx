import React, { useEffect, useRef, useState } from "react";
import "./TopNavigation.css";

const getDivisionBadge = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const customBadges = {
    CALOOCAN: "CAL",
    "LAS PI\u00d1AS": "LP",
    MAKATI: "MAK",
    MALABON: "MAL",
    MANDALUYONG: "MDY",
    MANILA: "MNL",
    MARIKINA: "MRK",
    MUNTINLUPA: "MUN",
    NAVOTAS: "NAV",
    PARA\u00d1AQUE: "PAR",
    PASAY: "PSY",
    PASIG: "PSG",
    "QUEZON CITY": "QC",
    "SAN JUAN": "SJ",
    "TAGUIG CITY & PATEROS": "TGP",
    VALENZUELA: "VAL",
  };

  return (
    customBadges[normalized] ||
    normalized
      .split(/[\s&]+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 3)
  );
};

const getDivisionLogoSrc = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const logoMap = {
    CALOOCAN: "/caloocan.png",
    "LAS PI\u00d1AS": encodeURI("/las pi\u00f1as.png"),
    MAKATI: "/makati.png",
    MALABON: "/malabon.png",
    MANDALUYONG: "/mandaluyong.png",
    MANILA: "/manila.jpeg",
    MARIKINA: "/marikina.png",
    MUNTINLUPA: "/muntinlupa.png",
    NAVOTAS: "/navotas.png",
    PARA\u00d1AQUE: encodeURI("/para\u00f1aque.png"),
    PASAY: "/pasay.png",
    PASIG: "/pasig.png",
    "QUEZON CITY": encodeURI("/quezon city.jpg"),
    "SAN JUAN": encodeURI("/san juan.png"),
    "TAGUIG CITY & PATEROS": encodeURI("/taguig&pateros.jpg"),
    VALENZUELA: "/valenzuela.png",
  };

  return logoMap[normalized] || "";
};

const getDivisionDisplayName = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const displayNames = {
    CALOOCAN: "Caloocan City",
    "LAS PI\u00d1AS": "Las Pi\u00f1as City",
    MAKATI: "Makati City",
    MALABON: "Malabon City",
    MANDALUYONG: "Mandaluyong City",
    MANILA: "Manila",
    MARIKINA: "Marikina City",
    MUNTINLUPA: "Muntinlupa City",
    NAVOTAS: "Navotas City",
    PARA\u00d1AQUE: "Para\u00f1aque City",
    PASAY: "Pasay City",
    PASIG: "Pasig City",
    "QUEZON CITY": "Quezon City",
    "SAN JUAN": "San Juan City",
    "TAGUIG CITY & PATEROS": "Taguig City & Pateros",
    VALENZUELA: "Valenzuela City",
  };

  return displayNames[normalized] || normalized;
};

const getDivisionLogoClassName = (divisionName) => {
  const normalized = String(divisionName || "").trim();

  const logoClasses = {
    MANILA: "division-logo-image-manila",
    "TAGUIG CITY & PATEROS": "division-logo-image-taguig-pateros",
  };

  return logoClasses[normalized] || "";
};

const TopNavigation = ({
  divisions,
  onCitySelect,
  onHomeClick,
  onEnrolmentClick,
  onMapClick,
  onShsMapClick,
  currentSelection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const logoScrollerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollDivisionLogos = (direction) => {
    if (!logoScrollerRef.current) {
      return;
    }

    logoScrollerRef.current.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  return (
    <header className={`top-nav-container ${isScrolled ? "scrolled" : ""}`}>
      <div className="main-banner">
        <div className="banner-left" onClick={onHomeClick} style={{ cursor: "pointer" }}>
          <img src="/deped.png" alt="DepEd Logo" className="deped-logo-img" />
          <div className="banner-text">
            <p className="republic-text">REPUBLIC OF THE PHILIPPINES</p>
            <h1 className="dept-text">DEPARTMENT OF EDUCATION</h1>
            <p className="region-text">NATIONAL CAPITAL REGION</p>
          </div>
        </div>

        <div className="banner-right">
          <div className="banner-actions">
            <button type="button" className="utility-button active" onClick={onHomeClick}>
              Regional Overview
            </button>
            <button type="button" className="utility-button" onClick={onEnrolmentClick}>
              Enrolment 2025-2026
            </button>
            <button type="button" className="utility-button" onClick={onMapClick}>
              NCR Division Map
            </button>
            <button type="button" className="utility-button" onClick={onShsMapClick}>
              ALS Schools Map
            </button>
            {currentSelection ? (
              <button type="button" className="utility-button utility-button-current">
                {currentSelection}
              </button>
            ) : null}
          </div>
          <img src="/als.png" alt="ALS Logo" className="als-logo-img" />
        </div>
      </div>

      <div className="division-logo-bar">
        <button
          type="button"
          className="division-scroll-arrow division-scroll-arrow-left"
          onClick={() => scrollDivisionLogos(-1)}
          aria-label="Scroll divisions left"
        >
          &#10094;
        </button>

        <div
          className="division-logo-grid"
          role="tablist"
          aria-label="Select NCR division"
          ref={logoScrollerRef}
        >
          <button
            type="button"
            className={`division-logo-card division-logo-card-home ${currentSelection ? "" : "active"}`}
            onClick={onHomeClick}
          >
            <span className="division-logo-image-shell division-logo-image-shell-home">
              <img src="/NCR_zzz.png" alt="NCR Regional Home" className="division-logo-image" />
            </span>
            <span className="division-logo-name">Regional Home</span>
          </button>

          {divisions.map((division) => {
            const logoSrc = getDivisionLogoSrc(division.division);
            const logoClassName = getDivisionLogoClassName(division.division);

            return (
              <button
                key={division.divisionId || division.division}
                type="button"
                className={`division-logo-card ${
                  currentSelection === division.division ? "active" : ""
                }`}
                onClick={() => onCitySelect(division.division)}
              >
                <span className="division-logo-image-shell">
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={`${division.division} logo`}
                      className={`division-logo-image ${logoClassName}`.trim()}
                    />
                  ) : (
                    <span className="division-logo-mark">{getDivisionBadge(division.division)}</span>
                  )}
                </span>
                <span className="division-logo-name">
                  {getDivisionDisplayName(division.division)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="division-scroll-arrow division-scroll-arrow-right"
          onClick={() => scrollDivisionLogos(1)}
          aria-label="Scroll divisions right"
        >
          &#10095;
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
