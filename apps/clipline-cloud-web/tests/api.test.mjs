import test from "node:test";
import assert from "node:assert/strict";

globalThis.window = new EventTarget();
const { api, ApiError, setCsrfToken } = await import("../src/lib/api.js");

test("api parses json, sets CSRF on mutations, maps errors", async () => {
  let captured;
  globalThis.fetch = async (path, init) => {
    captured = { path, init };
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { "content-type": "application/json" } });
  };
  setCsrfToken("tok");
  await api("/api/v1/clips/x/visibility", { method: "POST", body: { visibility: "public" } });
  assert.equal(captured.init.headers.get("X-CSRF-Token"), "tok");
  assert.equal(captured.init.headers.get("Content-Type"), "application/json");

  globalThis.fetch = async () => new Response(JSON.stringify({ error: "nope" }), {
    status: 403, headers: { "content-type": "application/json" } });
  await assert.rejects(() => api("/x"), (e) => e instanceof ApiError && e.status === 403 && e.message === "nope");

  let unauthorized = 0;
  window.addEventListener("clipline:unauthorized", () => unauthorized++);
  globalThis.fetch = async () => new Response("{}", { status: 401, headers: { "content-type": "application/json" } });
  await assert.rejects(() => api("/x"));
  assert.equal(unauthorized, 1);
});

test("api falls back to statusText for non-JSON error responses", async () => {
  globalThis.fetch = async () => new Response("<html>oops</html>", {
    status: 500,
    statusText: "Internal Server Error",
    headers: { "content-type": "text/html" }
  });
  await assert.rejects(
    () => api("/x"),
    (e) => e instanceof ApiError && e.status === 500 && e.message === "Internal Server Error"
  );
});

test("api does not set CSRF token on GET requests", async () => {
  let captured;
  globalThis.fetch = async (path, init) => {
    captured = { path, init };
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  setCsrfToken("tok");
  await api("/api/v1/auth/me");
  assert.equal(captured.init.headers.get("X-CSRF-Token"), null);

  // Verify POST does set it
  captured = null;
  globalThis.fetch = async (path, init) => {
    captured = { path, init };
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  await api("/api/v1/auth/me", { method: "POST" });
  assert.equal(captured.init.headers.get("X-CSRF-Token"), "tok");
});
