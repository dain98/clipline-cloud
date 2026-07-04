// Pure port of legacy currentRoute() (../app.js:182-233) plus its helpers
// (safeDecodeURIComponent at :243, publicRouteQuery at :276), reading from
// arguments instead of window.location so this module has no DOM dependency.

export function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (_) {
    return value;
  }
}

export function publicRouteQuery(params) {
  const page = Number(params.get("page") || 1);
  return {
    sort: params.get("sort") || "uploaded_at_desc",
    game: params.get("game") || "",
    q: params.get("q") || "",
    page: Number.isFinite(page) ? Math.max(1, page) : 1,
  };
}

// Public routes that must never be bounced to /login when a request comes
// back 401 (e.g. an expired session hitting a public API from a public page).
export const PUBLIC_ROUTE_NAMES = [
  "login", "resetPassword", "public", "publicLibrary", "publicGame", "publicUser", "about", "games",
];

export function isPublicRouteName(name) {
  return PUBLIC_ROUTE_NAMES.includes(name);
}

export function shouldRedirectToLogin(routeName, user) {
  return !user && !isPublicRouteName(routeName);
}

const TOP_NAV_KEYS = {
  publicLibrary: "feed",
  publicGame: "feed",
  games: "games",
  library: "library",
  clip: "library",
  admin: "admin",
  profile: "profile",
};

export function topNavKeyForRoute(route) {
  return TOP_NAV_KEYS[route?.name] || "";
}

export function tabNavKeyForRoute(route) {
  if (route?.name === "publicLibrary" && route.surface === "search") return "search";
  return topNavKeyForRoute(route);
}

export function parseRoute(pathname, search) {
  const params = new URLSearchParams(search || "");
  const path = pathname;

  if (path.startsWith("/c/")) {
    return { name: "public", shareId: safeDecodeURIComponent(path.slice(3)) };
  }
  if (path === "/" || path === "/public" || path === "/search") {
    return { name: "publicLibrary", query: publicRouteQuery(params), surface: path === "/search" ? "search" : "feed" };
  }
  if (path.startsWith("/game/")) {
    return {
      name: "publicGame",
      game: safeDecodeURIComponent(path.slice(6)),
      query: publicRouteQuery(params),
    };
  }
  if (path === "/about") {
    return { name: "about" };
  }
  if (path === "/games") {
    return { name: "games" };
  }
  if (path.startsWith("/u/")) {
    return { name: "publicUser", username: safeDecodeURIComponent(path.slice(3)) };
  }
  if (path === "/library") {
    return { name: "library" };
  }
  if (path.startsWith("/clip/")) {
    return { name: "clip", clipId: safeDecodeURIComponent(path.slice(6)) };
  }
  if (path === "/admin") {
    return {
      name: "admin",
      tab: params.get("tab") || "overview",
    };
  }
  if (path === "/account") {
    return { name: "account" };
  }
  if (path === "/profile") {
    return { name: "profile" };
  }
  if (path === "/login") {
    return { name: "login" };
  }
  if (path === "/reset-password") {
    return {
      name: "resetPassword",
      token: params.get("token") || "",
      invite: params.get("invite") === "1",
    };
  }
  return { name: "publicLibrary" };
}
