const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DASHBOARD_DATA_URL = `${API_BASE_URL}/api/data`;
const ENROLMENT_DATA_URL = `${API_BASE_URL}/api/enrolment`;
const SCHOOLS_DATA_URL = `${API_BASE_URL}/api/schools`;
const CLCSHA_DATA_URL = `${API_BASE_URL}/api/clcsha`;
const DATA_SOURCES_URL = `${API_BASE_URL}/api/data-sources`;

const parseErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload.error || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};

export const fetchDashboardData = async () => {
  const payload = await fetchJson(DASHBOARD_DATA_URL);

  if (!Array.isArray(payload)) {
    throw new Error("Dashboard API returned an unexpected response shape.");
  }

  return payload;
};

export const fetchEnrolmentData = () => fetchJson(ENROLMENT_DATA_URL);

export const fetchSchoolsData = () => fetchJson(SCHOOLS_DATA_URL);

export const fetchClcshaSummary = () => fetchJson(CLCSHA_DATA_URL);

export const fetchClcshaRows = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString();
  return fetchJson(`${CLCSHA_DATA_URL}/rows${suffix ? `?${suffix}` : ""}`);
};

export const fetchDataSources = () => fetchJson(DATA_SOURCES_URL);

export const fetchDataSourceAnalytics = () => fetchJson(`${DATA_SOURCES_URL}/analytics`);

export const fetchDataSourceRows = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString();
  return fetchJson(`${DATA_SOURCES_URL}/rows${suffix ? `?${suffix}` : ""}`);
};

export const exportDataSourceRows = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(
    `${DATA_SOURCES_URL}/export${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.blob();
};

export const uploadDataSourceFile = ({ sourceId, file, onProgress }) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("A file is required for upload."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Unable to read the selected Excel file."));
    };

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64Payload = result.includes(",") ? result.split(",")[1] : result;
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${DATA_SOURCES_URL}/upload`);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && typeof onProgress === "function") {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const payload = JSON.parse(xhr.responseText || "{}");

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(payload);
            return;
          }

          reject(new Error(payload.error || "Upload failed."));
        } catch {
          reject(new Error("Upload completed, but the server response could not be parsed."));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed because the server is unreachable."));

      xhr.send(
        JSON.stringify({
          sourceId,
          fileName: file.name,
          fileContentBase64: base64Payload,
        })
      );
    };

    reader.readAsDataURL(file);
  });
