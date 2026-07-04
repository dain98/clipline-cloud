import { html } from "./html.js";
import { icons } from "./icon-paths.js";

export function icon(name, { size = 18 } = {}) {
  return html`<svg viewBox="0 0 24 24" width=${size} height=${size} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{ __html: icons[name] || "" }} />`;
}
