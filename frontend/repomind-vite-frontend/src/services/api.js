
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

// Common API request handler
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {})
    }
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  // Handle expired or invalid JWT
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error("Session expired. Please login again.");
  }

  // Handle other API errors
  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

// GET request
async function get(endpoint) {
  return request(endpoint, {
    method: "GET"
  });
}

// POST request
async function post(endpoint, payload) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// ------------------------------------
// Repository Analysis
// ------------------------------------

export const analyzeRepository = (repositoryUrl) =>
  post("/repositories/analyze", {
    repository_url: repositoryUrl
  });

// ------------------------------------
// Job Matching
// ------------------------------------

export const analyzeJobMatch = (repositoryUrl, jobDescription) =>
  post("/matching/analyze", {
    repository_url: repositoryUrl,
    job_description: jobDescription
  });

// ------------------------------------
// Interactive Learning
// ------------------------------------

export const askProjectQuestion = (repositoryUrl, question) =>
  post("/learning/ask", {
    repository_url: repositoryUrl,
    question
  });

// ------------------------------------
// Analysis History
// ------------------------------------

export const getAnalysisHistory = () =>
  get("/history/analyses");

// ------------------------------------
// Matching History
// ------------------------------------

export const getMatchingHistory = () =>
  get("/history/matches");

// ------------------------------------
// Health Check
// ------------------------------------

export const checkBackendHealth = () =>
  get("/health");
