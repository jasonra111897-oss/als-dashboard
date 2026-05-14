const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatWorkbookDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const utcMillis = Math.round((value - 25569) * 86400 * 1000);
    const date = new Date(utcMillis);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime()) && /\d/.test(String(value))) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  }

  return String(value).replace(/\s+/g, " ").trim();
};

const toDateValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const utcMillis = Math.round((value - 25569) * 86400 * 1000);
    const date = new Date(utcMillis);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getServiceWindowLabel = (serviceFrom, serviceTo) => {
  const fromLabel = formatWorkbookDate(serviceFrom);
  const toLabel = String(serviceTo || "").trim();

  if (fromLabel && toLabel) {
    return `${fromLabel} to ${toLabel}`;
  }

  if (fromLabel) {
    return `Since ${fromLabel}`;
  }

  if (toLabel) {
    return `Until ${toLabel}`;
  }

  return "Service dates not provided";
};

export { formatNumber, formatWorkbookDate, getServiceWindowLabel, toDateValue };
