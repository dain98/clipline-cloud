import { html } from "../lib/html.js";

// meter is a 0..1 fraction; omit it (undefined/null) to render no gauge bar.
// tone recolors the value (and gauge, when present) — "success" for the
// "all healthy" states, "danger" for over-threshold/failing states.
export function StatCard({ label, value, sub, meter, tone }) {
  const toneClass = tone ? ` stat-${tone}` : "";
  return html`<div class="stat-card">
    <p class="stat-label">${label}</p>
    <p class=${`stat-value${toneClass}`}>${value}</p>
    ${sub != null && html`<p class="stat-sub">${sub}</p>`}
    ${meter != null && html`<div class="stat-meter${toneClass}">
      <span style=${`width:${Math.max(0, Math.min(1, meter)) * 100}%`}></span>
    </div>`}
  </div>`;
}
