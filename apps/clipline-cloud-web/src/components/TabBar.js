import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
import { session, useStore } from "../lib/store.js";

// Mirrors TopBar's Library gating (nav.filter on `!!user`, TopBar.js:33) —
// Library and Profile need a signed-in session; anonymous mobile users only
// get the public Feed + Games + Search tabs.
const ALL_TABS = [
  ["feed", "/", "home", "Feed", true],
  ["games", "/games", "globe", "Games", true],
  ["library", "/library", "library", "Library", "auth"],
  ["search", "/search", "search", "Search", true],
  ["profile", "/profile", "user", "Profile", "auth"],
];

export function visibleTabs(user) {
  return ALL_TABS.filter(([, , , , requirement]) => requirement !== "auth" || Boolean(user));
}

export function TabBar({ active }) {
  const { user } = useStore(session);
  const tabs = visibleTabs(user);
  return html`<nav class="tabbar" aria-label="Primary">
    ${tabs.map(([key, href, ic, label]) => html`
      <a class=${key === active ? "tab-on" : ""} href=${href}>${icon(ic)}<span>${label}</span></a>`)}
  </nav>`;
}
