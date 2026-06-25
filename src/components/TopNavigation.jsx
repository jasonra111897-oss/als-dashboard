import React, { useEffect, useRef, useState } from "react";
import "./TopNavigation.css";

const PST_BANNER_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const PRIMARY_NAV_ITEMS = [
  { key: "regional", label: "Home" },
  { key: "about", label: "About ALS" },
  { key: "als-structure", label: "ALS Structure" },
  { key: "enrolment", label: "Enrolment 2025-2026" },
];

const MAP_NAV_ITEMS = [
  { key: "division-map", label: "Division Map" },
  { key: "schools-map", label: "ALS Schools Map" },
];

const TopNavigation = ({
  onHomeClick,
  onAboutClick,
  onStructureClick,
  onEnrolmentClick,
  onMapClick,
  onShsMapClick,
  onClcshaDataClick,
  activeView = "regional",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMapsOpen, setIsMapsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const mapsDropdownRef = useRef(null);
  const isMapsActive = activeView === "division-map" || activeView === "schools-map";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!mapsDropdownRef.current?.contains(event.target)) {
        setIsMapsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMapsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePrimaryNavClick = (key) => {
    setIsMapsOpen(false);

    switch (key) {
      case "regional":
        onHomeClick();
        break;
      case "about":
        onAboutClick();
        break;
      case "als-structure":
        onStructureClick();
        break;
      case "enrolment":
        onEnrolmentClick();
        break;
      case "clcsha-data":
        onClcshaDataClick();
        break;
      default:
        break;
    }
  };

  const handleMapNavClick = (key) => {
    setIsMapsOpen(false);

    switch (key) {
      case "division-map":
        onMapClick();
        break;
      case "schools-map":
        onShsMapClick();
        break;
      default:
        break;
    }
  };

  const formattedPst = PST_BANNER_FORMATTER.format(currentTime);

  return (
    <header className={`top-nav-container ${isScrolled ? "scrolled" : ""}`}>
      <div className="main-banner">
        <div className="banner-left">
          <img src="/DEPED LOGOS.png" alt="Department of Education NCR" className="deped-logo-img" />
          <div className="banner-text">
            <p className="republic-text">Republic of the Philippines</p>
            <h1 className="dept-text">DEPARTMENT OF EDUCATION</h1>
            <p className="region-text">National Capital Region</p>
          </div>
        </div>

        <nav className="banner-actions" aria-label="Primary navigation">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`utility-button ${activeView === item.key ? "active" : ""}`}
              onClick={() => handlePrimaryNavClick(item.key)}
            >
              {item.label}
            </button>
          ))}

          <div className="nav-dropdown" ref={mapsDropdownRef}>
            <button
              type="button"
              className={`utility-button nav-dropdown-trigger ${isMapsActive ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={isMapsOpen}
              onClick={() => setIsMapsOpen((current) => !current)}
            >
              Maps
              <span className={`nav-dropdown-caret ${isMapsOpen ? "open" : ""}`} aria-hidden="true" />
            </button>

            <div className={`nav-dropdown-menu ${isMapsOpen ? "open" : ""}`} role="menu">
              {MAP_NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`nav-dropdown-item ${activeView === item.key ? "active" : ""}`}
                  role="menuitem"
                  onClick={() => handleMapNavClick(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`utility-button ${activeView === "clcsha-data" ? "active" : ""}`}
            onClick={() => handlePrimaryNavClick("clcsha-data")}
          >
            Community Learning Centers
          </button>
        </nav>

        <div className="banner-time" aria-label="Philippine Standard Time">
          <span className="banner-time-label">Philippine Standard Time:</span>
          <strong className="banner-time-value">{formattedPst}</strong>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
