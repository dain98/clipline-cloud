import { render } from "preact";
import { html } from "./lib/html.js";
import { api, setCsrfToken } from "./lib/api.js";
import { session, useStore } from "./lib/store.js";
import { useRoute, onLinkClick, navigate } from "./lib/router.js";
import { TopBar } from "./components/TopBar.js";
import { TabBar } from "./components/TabBar.js";
import { ToastHost } from "./components/ToastHost.js";

const PAGES = {
  // filled in by later tasks:
  // publicLibrary: FeedPage, publicGame: FeedPage, library: LibraryPage, …
};

const NAV_KEY = { publicLibrary: "feed", publicGame: "feed", games: "games",
  library: "library", clip: "library", admin: "admin", profile: "profile" };

// Public routes that must never be bounced to /login when a request comes
// back 401 (e.g. an expired session hitting a public API from a public page).
const PUBLIC_ROUTE_NAMES = [
  "login", "resetPassword", "public", "publicLibrary", "publicGame", "publicUser", "about", "games",
];

let currentRouteName = "";

function LegacyRedirect({ route }) {
  return html`<main class="page"><p class="kicker">Not ported yet</p>
    <p>Route <code>${route.name}</code> still renders in the legacy app — open it from
    <a href="/">the served site</a>.</p></main>`;
}

function App() {
  const route = useRoute();
  currentRouteName = route.name;
  const { ready } = useStore(session);
  if (!ready) return html`<div class="boot">Loading…</div>`;
  const Page = PAGES[route.name] || LegacyRedirect;
  const bare = route.name === "login" || route.name === "resetPassword";
  return html`<div class="ui" onClick=${onLinkClick}>
    ${!bare && html`<${TopBar} active=${NAV_KEY[route.name] || ""} />`}
    <${Page} route=${route} />
    ${!bare && html`<${TabBar} active=${NAV_KEY[route.name] || ""} />`}
    <${ToastHost} />
  </div>`;
}

window.addEventListener("clipline:unauthorized", () => {
  session.set({ user: null, csrfToken: null, ready: true });
  if (!PUBLIC_ROUTE_NAMES.includes(currentRouteName)) navigate("/login");
});

(async () => {
  try {
    const me = await api("/api/v1/auth/me");
    setCsrfToken(me.csrf_token);
    session.set({ user: me.user, csrfToken: me.csrf_token, ready: true });
  } catch {
    session.set({ user: null, csrfToken: null, ready: true });
  }
  render(html`<${App} />`, document.querySelector("#app"));
})();
