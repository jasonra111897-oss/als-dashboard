const UNKNOWN_DIVISION_FALLBACK = "Unknown Division";

const normalizeDivisionKey = (divisionName) =>
  String(divisionName || "")
    .trim()
    .toUpperCase()
    .replace(/LAS PIÃƒâ€˜AS|LAS PIÃ‘AS/g, "LAS PI\u00d1AS")
    .replace(/PARAÃƒâ€˜AQUE|PARAÃ‘AQUE/g, "PARA\u00d1AQUE");

const DIVISION_METADATA = {
  CALOOCAN: {
    badge: "CAL",
    displayName: "Caloocan City",
    officeTitle: "Schools Division Office - Caloocan City",
    logoSrc: "/caloocan.png",
  },
  "LAS PI\u00d1AS": {
    badge: "LP",
    displayName: "Las Pi\u00f1as City",
    officeTitle: "Schools Division Office - Las Pi\u00f1as City",
    logoSrc: encodeURI("/las pi\u00f1as.png"),
  },
  MAKATI: {
    badge: "MAK",
    displayName: "Makati City",
    officeTitle: "Schools Division Office - Makati City",
    logoSrc: "/makati.png",
  },
  MALABON: {
    badge: "MAL",
    displayName: "Malabon City",
    officeTitle: "Schools Division Office - Malabon City",
    logoSrc: "/malabon.png",
  },
  MANDALUYONG: {
    badge: "MDY",
    displayName: "Mandaluyong City",
    officeTitle: "Schools Division Office - Mandaluyong City",
    logoSrc: "/mandaluyong.png",
  },
  MANILA: {
    badge: "MNL",
    displayName: "Manila",
    officeTitle: "Schools Division Office - Manila",
    logoSrc: "/manila.jpeg",
    logoClassName: "division-logo-image-manila",
  },
  MARIKINA: {
    badge: "MRK",
    displayName: "Marikina City",
    officeTitle: "Schools Division Office - Marikina City",
    logoSrc: "/marikina.png",
  },
  MUNTINLUPA: {
    badge: "MUN",
    displayName: "Muntinlupa City",
    officeTitle: "Schools Division Office - Muntinlupa City",
    logoSrc: "/muntinlupa.png",
  },
  NAVOTAS: {
    badge: "NAV",
    displayName: "Navotas City",
    officeTitle: "Schools Division Office - Navotas City",
    logoSrc: "/navotas.png",
  },
  "PARA\u00d1AQUE": {
    badge: "PAR",
    displayName: "Para\u00f1aque City",
    officeTitle: "Schools Division Office - Para\u00f1aque City",
    logoSrc: encodeURI("/para\u00f1aque.png"),
  },
  PASAY: {
    badge: "PSY",
    displayName: "Pasay City",
    officeTitle: "Schools Division Office - Pasay City",
    logoSrc: "/pasay.png",
  },
  PASIG: {
    badge: "PSG",
    displayName: "Pasig City",
    officeTitle: "Schools Division Office - Pasig City",
    logoSrc: "/pasig.png",
  },
  "QUEZON CITY": {
    badge: "QC",
    displayName: "Quezon City",
    officeTitle: "Schools Division Office - Quezon City",
    logoSrc: encodeURI("/quezon city.jpg"),
  },
  "SAN JUAN": {
    badge: "SJ",
    displayName: "San Juan City",
    officeTitle: "Schools Division Office - San Juan City",
    logoSrc: encodeURI("/san juan.png"),
  },
  "TAGUIG CITY & PATEROS": {
    badge: "TGP",
    displayName: "Taguig City & Pateros",
    officeTitle: "Schools Division Office - Taguig City and Pateros",
    logoSrc: encodeURI("/taguig&pateros.jpg"),
    logoClassName: "division-logo-image-taguig-pateros",
  },
  VALENZUELA: {
    badge: "VAL",
    displayName: "Valenzuela City",
    officeTitle: "Schools Division Office - Valenzuela City",
    logoSrc: "/valenzuela.png",
  },
};

const getDivisionMetadata = (divisionName) => {
  const normalized = normalizeDivisionKey(divisionName);
  return DIVISION_METADATA[normalized] || null;
};

const getDivisionBadge = (divisionName) => {
  const normalized = normalizeDivisionKey(divisionName);
  const badge = getDivisionMetadata(normalized)?.badge;

  if (badge) {
    return badge;
  }

  return normalized
    .split(/[\s&]+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3);
};

const getDivisionDisplayName = (divisionName) =>
  getDivisionMetadata(divisionName)?.displayName ||
  normalizeDivisionKey(divisionName) ||
  UNKNOWN_DIVISION_FALLBACK;

const getDivisionOfficeTitle = (divisionName) =>
  getDivisionMetadata(divisionName)?.officeTitle ||
  `Schools Division Office - ${normalizeDivisionKey(divisionName) || UNKNOWN_DIVISION_FALLBACK}`;

const getDivisionLogoSrc = (divisionName) => getDivisionMetadata(divisionName)?.logoSrc || "";

const getDivisionLogoClassName = (divisionName) =>
  getDivisionMetadata(divisionName)?.logoClassName || "";

const getDivisionInitials = (divisionName) =>
  normalizeDivisionKey(divisionName)
    .split(/[\s&]+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3);

export {
  getDivisionBadge,
  getDivisionDisplayName,
  getDivisionInitials,
  getDivisionLogoClassName,
  getDivisionLogoSrc,
  getDivisionMetadata,
  getDivisionOfficeTitle,
  normalizeDivisionKey,
};
