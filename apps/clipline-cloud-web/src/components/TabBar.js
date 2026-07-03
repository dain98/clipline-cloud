import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";

export function TabBar({ active }) {
  const tabs = [
    ["feed", "/", "home", "Feed"],
    ["library", "/library", "library", "Library"],
    ["search", "/search", "search", "Search"],
    ["profile", "/profile", "user", "Profile"],
  ];
  return html`<nav class="tabbar" aria-label="Primary">
    ${tabs.map(([key, href, ic, label]) => html`
      <a class=${key === active ? "tab-on" : ""} href=${href}>${icon(ic)}<span>${label}</span></a>`)}
  </nav>`;
}
