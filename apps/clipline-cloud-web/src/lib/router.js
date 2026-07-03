import { useEffect, useState } from "preact/hooks";
import { parseRoute } from "./routes.js";

const isPreview = () => window.location.pathname === "/preview.html";

// Pure: split a "/preview.html#/path?query" style hash into the
// { pathname, search } shape parseRoute() expects. Extracted so it is
// testable without a DOM/window.
export function previewHashToLocation(hash) {
  const trimmed = hash.slice(1) || "/";
  const [pathname, search = ""] = trimmed.split("?");
  return { pathname, search: search ? `?${search}` : "" };
}

export function readLocation() {
  if (isPreview()) return previewHashToLocation(window.location.hash);
  return { pathname: window.location.pathname, search: window.location.search };
}

// Pure: resolve a { pathname, search } location down to just the route name.
// Extracted so main.js can seed its module-level currentRouteName from the
// real initial location (before the session-bootstrap fetch resolves) and so
// that seeding logic is unit-testable without a DOM/window.
export function initialRouteName(loc) {
  return parseRoute(loc.pathname, loc.search).name;
}

const listeners = new Set();
export function navigate(path) {
  if (isPreview()) window.location.hash = path;
  else window.history.pushState({}, "", path);
  emit();
}
function emit() {
  const { pathname, search } = readLocation();
  const route = parseRoute(pathname, search);
  listeners.forEach((l) => l(route));
}
window.addEventListener("popstate", emit);
window.addEventListener("hashchange", emit);

export function useRoute() {
  const { pathname, search } = readLocation();
  const [route, setRoute] = useState(() => parseRoute(pathname, search));
  useEffect(() => {
    listeners.add(setRoute);
    return () => listeners.delete(setRoute);
  }, []);
  return route;
}

// intercept plain <a href> clicks inside the app for SPA navigation
export function onLinkClick(event) {
  const a = event.target.closest("a[href^='/']");
  if (!a || a.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(a.getAttribute("href"));
}
