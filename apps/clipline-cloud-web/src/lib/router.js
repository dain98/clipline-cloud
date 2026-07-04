import { useEffect, useState } from "preact/hooks";
import { parseRoute } from "./routes.js";

// Pure: resolve a { pathname, search } location down to just the route name.
// Extracted so main.js can seed its module-level currentRouteName from the
// real initial location (before the session-bootstrap fetch resolves) and so
// that seeding logic is unit-testable without a DOM/window.
export function initialRouteName(loc) {
  return parseRoute(loc.pathname, loc.search).name;
}

const listeners = new Set();
export function navigate(path) {
  window.history.pushState({}, "", path);
  emit();
}
function emit() {
  const { pathname, search } = window.location;
  const route = parseRoute(pathname, search);
  listeners.forEach((l) => l(route));
}
window.addEventListener("popstate", emit);

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname, window.location.search));
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
