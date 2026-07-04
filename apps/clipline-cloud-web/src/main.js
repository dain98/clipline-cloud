import { render } from "preact";
import { html } from "./lib/html.js";
import { api, setCsrfToken } from "./lib/api.js";
import { session, useStore } from "./lib/store.js";
import { useRoute, onLinkClick, navigate, readLocation, initialRouteName } from "./lib/router.js";
import { isPublicRouteName } from "./lib/routes.js";
import { TopBar } from "./components/TopBar.js";
import { TabBar } from "./components/TabBar.js";
import { ToastHost } from "./components/ToastHost.js";
import { FeedPage } from "./pages/feed.js";
import { GamesPage } from "./pages/games.js";
import { LibraryPage } from "./pages/library.js";
import { WatchPage } from "./pages/watch.js";
import { LoginPage, ResetPasswordPage } from "./pages/login.js";
import { AdminPage } from "./pages/admin.js";
import { ProfilePage } from "./pages/profile.js";
import { AccountPage } from "./pages/account.js";
import { UserPage } from "./pages/user.js";
import { AboutPage } from "./pages/about.js";

const PAGES = {
  publicLibrary: FeedPage,
  publicGame: FeedPage,
  games: GamesPage,
  library: LibraryPage,
  clip: WatchPage,
  public: WatchPage,
  login: LoginPage,
  resetPassword: ResetPasswordPage,
  admin: AdminPage,
  profile: ProfilePage,
  account: AccountPage,
  publicUser: UserPage,
  about: AboutPage,
};

const NAV_KEY = { publicLibrary: "feed", publicGame: "feed", games: "games",
  library: "library", clip: "library", admin: "admin", profile: "profile" };

// Seeded from the *actual* initial location so the unauthorized-listener
// below knows whether the very first paint is on a public route, before the
// session-bootstrap fetch below has resolved (and possibly 401'd).
let currentRouteName = initialRouteName(readLocation());

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
  if (!isPublicRouteName(currentRouteName)) navigate("/login");
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
