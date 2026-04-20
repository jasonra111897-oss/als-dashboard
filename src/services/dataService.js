const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DASHBOARD_DATA_URL = `${API_BASE_URL}/api/data`;
const ENROLMENT_DATA_URL = `${API_BASE_URL}/api/enrolment`;

const parseErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload.error || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

export const fetchDashboardData = async () => {
  const response = await fetch(DASHBOARD_DATA_URL);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Dashboard API returned an unexpected response shape.");
  }

  return payload;
};

export const fetchEnrolmentData = async () => {
  const response = await fetch(ENROLMENT_DATA_URL);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};
