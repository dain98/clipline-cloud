import { state } from "/js/state.js";

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  let body = options.body;
  if (body && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && state.csrfToken) {
    headers.set("X-CSRF-Token", state.csrfToken);
  }

  const response = await fetch(path, {
    ...options,
    body,
    credentials: "same-origin",
    headers,
    method,
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" && data && data.error ? data.error : response.statusText;
    throw new Error(message || "Request failed");
  }
  return data;
}

export async function refreshSession() {
  try {
    const data = await api("/api/v1/auth/me");
    state.user = data.user;
    state.csrfToken = data.csrf_token;
    return true;
  } catch (error) {
    state.user = null;
    state.csrfToken = null;
    return false;
  }
}

export async function logout() {
  try {
    await api("/api/v1/auth/logout", { method: "POST", body: {} });
  } catch (_) {
    // The local session is cleared either way.
  }
  state.user = null;
  state.csrfToken = null;
  // Use dynamic import to avoid static circular dependency (api -> router -> views -> api)
  const { navigate } = await import("/js/router.js");
  navigate("/login");
}
