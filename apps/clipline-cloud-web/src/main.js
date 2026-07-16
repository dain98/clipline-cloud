import { render } from "preact";
import { useEffect } from "preact/hooks";
import { html } from "./lib/html.js";
import { api, setCsrfToken } from "./lib/api.js";
import { session, useStore } from "./lib/store.js";
import { useRoute, onLinkClick, navigate } from "./lib/router.js";
import {
  isPublicRouteName,
  parseRoute,
  shouldRedirectToLogin,
  tabNavKeyForRoute,
  topNavKeyForRoute,
} from "./lib/routes.js";
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

// Seeded from the *actual* initial location so the unauthorized-listener
// below knows whether the very first paint is on a public route, before the
// session-bootstrap fetch below has resolved (and possibly 401'd).
let currentRouteName = parseRoute(window.location.pathname, window.location.search).name;

function App() {
  const route = useRoute();
  currentRouteName = route.name;
  const { ready, user } = useStore(session);
  const loginRedirect = ready && shouldRedirectToLogin(route.name, user);
  useEffect(() => {
    if (loginRedirect) navigate("/login");
  }, [loginRedirect]);
  if (!ready || loginRedirect) return html`<div class="boot">Loading…</div>`;
  const Page = PAGES[route.name];
  const bare = route.name === "login" || route.name === "resetPassword";
  return html`<div class="ui" onClick=${onLinkClick}>
    ${!bare && html`<${TopBar} active=${topNavKeyForRoute(route)} route=${route} />`}
    <${Page} route=${route} />
    ${!bare && html`<${TabBar} active=${tabNavKeyForRoute(route)} />`}
    <${ToastHost} />
  </div>`;
}

window.addEventListener("clipline:unauthorized", () => {
  setCsrfToken(null);
  session.set({ user: null, csrfToken: null, ready: true });
  if (!isPublicRouteName(currentRouteName)) navigate("/login");
});

(async () => {
  try {
    const me = await api("/api/v1/auth/me");
    setCsrfToken(me.csrf_token);
    session.set({ user: me.user, csrfToken: me.csrf_token, ready: true });
  } catch {
    setCsrfToken(null);
    session.set({ user: null, csrfToken: null, ready: true });
  }
  // Preact's render() appends into the container rather than replacing its
  // contents, so the static boot-screen markup from index.html must be
  // cleared first or it stays in the DOM alongside the mounted app.
  const root = document.querySelector("#app");
  root.textContent = "";
  render(html`<${App} />`, root);
})();
