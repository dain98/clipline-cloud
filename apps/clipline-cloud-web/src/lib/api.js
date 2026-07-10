let csrfToken = null;
export function setCsrfToken(token) { csrfToken = token; }
export function getCsrfToken() { return csrfToken; }

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

function isSameOrigin(path) {
  try {
    const base = globalThis.location?.href || "http://clipline.invalid/";
    return new URL(path, base).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

async function readResponseBody(response, contentType) {
  const text = await response.text();
  if (!contentType.includes("application/json")) return text;
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    if (response.ok) throw error;
    return null;
  }
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
  const sameOrigin = isSameOrigin(path);
  if (!sameOrigin) {
    headers.delete("X-CSRF-Token");
  } else if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(path, { ...options, body, credentials: "same-origin", headers, method });
  const contentType = response.headers.get("content-type") || "";
  const data = await readResponseBody(response, contentType);
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("clipline:unauthorized"));
    }
    const message = typeof data === "object" && data?.error ? data.error : response.statusText;
    throw new ApiError(message || "Request failed", response.status);
  }
  return data;
}
