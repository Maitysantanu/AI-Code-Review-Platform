const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

async function post(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data?.message
      ? data.message
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const analyzeRepository = (repositoryUrl) =>
  post("/repositories/analyze", { repository_url: repositoryUrl });

export const analyzeJobMatch = (repositoryUrl, jobDescription) =>
  post("/matching/analyze", {
    repository_url: repositoryUrl,
    job_description: jobDescription
  });

export const askProjectQuestion = (repositoryUrl, question) =>
  post("/learning/ask", { repository_url: repositoryUrl, question });