import React, { useEffect, useMemo, useRef, useState } from "react";
import { ABOUT_SECTION_LINKS } from "../constants/aboutAls";
import {
  getDivisionBadge,
  getDivisionDisplayName,
  getDivisionLogoClassName,
  getDivisionLogoSrc,
} from "../constants/divisions";
import "./TopNavigation.css";

const PRIMARY_NAV_ITEMS = [
  { key: "regional", label: "Regional Overview" },
  { key: "about", label: "About ALS" },
  { key: "enrolment", label: "Enrolment 2025-2026" },
  { key: "division-map", label: "NCR Division Map" },
  { key: "schools-map", label: "ALS Schools Map" },
  { key: "clcsha-data", label: "CLCSHA Data" },
];

const TopNavigation = ({
  divisions = [],
  onCitySelect,
  onHomeClick,
  onAboutClick,
  onEnrolmentClick,
  onMapClick,
  onShsMapClick,
  onClcshaDataClick,
  currentSelection,
  activeView = "regional",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const divisionRailRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const divisionCards = useMemo(() => {
    const seen = new Set();

    return divisions
      .filter((division) => {
        const key = String(division?.division || "").trim();

        if (!key || seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .map((division) => {
        const divisionName = division.division;

        return {
          division: divisionName,
          badge: getDivisionBadge(divisionName),
          displayName: getDivisionDisplayName(divisionName),
          logoSrc: getDivisionLogoSrc(divisionName),
          logoClassName: getDivisionLogoClassName(divisionName),
        };
      });
  }, [divisions]);

  const scrollDivisionRail = (direction) => {
    if (!divisionRailRef.current) {
      return;
    }

    divisionRailRef.current.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const openAboutSection = (href) => {
    const scrollToSection = () => {
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    setIsAboutMenuOpen(false);

    if (activeView === "about") {
      scrollToSection();
      return;
    }

    onAboutClick();

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToSection);
    });
  };

  const handlePrimaryNavClick = (key) => {
    if (key !== "about") {
      setIsAboutMenuOpen(false);
    }

    switch (key) {
      case "regional":
        onHomeClick();
        break;
      case "about":
        if (activeView === "about") {
          setIsAboutMenuOpen((previous) => !previous);
        } else {
          onAboutClick();
        }
        break;
      case "enrolment":
        onEnrolmentClick();
        break;
      case "division-map":
        onMapClick();
        break;
      case "schools-map":
        onShsMapClick();
        break;
      case "clcsha-data":
        onClcshaDataClick();
        break;
      default:
        break;
    }
  };

  return (
    <header className={`top-nav-container ${isScrolled ? "scrolled" : ""}`}>
      <div className="main-banner">
        <div className="banner-left">
          <img src="/deped.png" alt="Department of Education NCR" className="deped-logo-img" />
          <div className="banner-text">
            <p className="republic-text">Republic of the Philippines</p>
            <h1 className="dept-text">DEPARTMENT OF EDUCATION</h1>
            <p className="region-text">National Capital Region</p>
          </div>
        </div>

        <div className="banner-right">
          <nav className="banner-actions" aria-label="Primary navigation">
            {PRIMARY_NAV_ITEMS.map((item) => {
              if (item.key === "about") {
                return (
                  <div
                    key={item.key}
                    className={`nav-dropdown ${activeView === "about" ? "active" : ""}`}
                    onMouseEnter={() => setIsAboutMenuOpen(true)}
                    onMouseLeave={() => setIsAboutMenuOpen(false)}
                  >
                    <button
                      type="button"
                      className={`utility-button nav-dropdown-trigger ${
                        activeView === "about" ? "active" : ""
                      }`}
                      onClick={() => handlePrimaryNavClick(item.key)}
                      aria-expanded={isAboutMenuOpen}
                    >
                      {item.label}
                      <span
                        className={`nav-dropdown-caret ${isAboutMenuOpen ? "open" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    <div className={`nav-dropdown-menu ${isAboutMenuOpen ? "open" : ""}`}>
                      {ABOUT_SECTION_LINKS.map((section) => (
                        <button
                          key={section.label}
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => openAboutSection(section.href)}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`utility-button ${activeView === item.key ? "active" : ""}`}
                  onClick={() => handlePrimaryNavClick(item.key)}
                >
                  {item.label}
                </button>
              );
            })}

            {currentSelection ? (
              <span className="utility-button utility-button-current">
                {getDivisionDisplayName(currentSelection)}
              </span>
            ) : null}
          </nav>

          <img src="/als.png" alt="ALS NCR" className="als-logo-img" />
        </div>
      </div>

      {activeView === "regional" ? (
        <div className="division-logo-bar">
          <button
            type="button"
            className="division-scroll-arrow"
            onClick={() => scrollDivisionRail(-1)}
            aria-label="Scroll divisions left"
          >
            <span className="division-scroll-arrow-icon left" aria-hidden="true" />
          </button>

          <div className="division-logo-grid" ref={divisionRailRef}>
            <button
              type="button"
              className={`division-logo-card ${!currentSelection ? "active" : ""}`}
              onClick={onHomeClick}
            >
              <span className="division-logo-image-shell division-logo-image-shell-home">
                <img src="/NCR_zzz.png" alt="Regional Home" className="division-logo-image" />
              </span>
              <span className="division-logo-name">Regional Home</span>
            </button>

            {divisionCards.map((division) => (
              <button
                key={division.division}
                type="button"
                className={`division-logo-card ${
                  currentSelection === division.division ? "active" : ""
                }`}
                onClick={() => onCitySelect(division.division)}
              >
                <span className="division-logo-image-shell">
                  {division.logoSrc ? (
                    <img
                      src={division.logoSrc}
                      alt={division.displayName}
                      className={`division-logo-image ${division.logoClassName}`.trim()}
                    />
                  ) : (
                    <span className="division-logo-mark">{division.badge}</span>
                  )}
                </span>
                <span className="division-logo-name">{division.displayName}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="division-scroll-arrow"
            onClick={() => scrollDivisionRail(1)}
            aria-label="Scroll divisions right"
          >
            <span className="division-scroll-arrow-icon right" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default TopNavigation;
