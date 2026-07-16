import { useEffect, useState } from "preact/hooks";
import { parseRoute } from "./routes.js";

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
if (typeof window !== "undefined") {
  window.addEventListener("popstate", emit);
}

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
