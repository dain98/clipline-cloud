let csrfToken = null;
export function setCsrfToken(token) { csrfToken = token; }
export function getCsrfToken() { return csrfToken; }

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  let body = options.body;
  if (body && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(path, { ...options, body, credentials: "same-origin", headers, method });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("clipline:unauthorized"));
    }
    const message = typeof data === "object" && data?.error ? data.error : response.statusText;
    throw new ApiError(message || "Request failed", response.status);
  }
  return data;
}
