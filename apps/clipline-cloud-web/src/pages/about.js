import { html } from "../lib/html.js";
import { useApiResource } from "../lib/use-api-resource.js";

const DEFAULT_ABOUT_TEXT = "Clipline is a self-hosted clip library for saved gameplay moments.";

function kv(label, value) {
  return html`<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

export function AboutPage() {
  // The about text is decorative copy on a public page, so retain the default
  // silently if the instance-specific copy cannot be loaded.
  const { data } = useApiResource("/api/v1/about", 0, { about_text: DEFAULT_ABOUT_TEXT });
  const aboutText = data?.about_text || DEFAULT_ABOUT_TEXT;

  return html`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${aboutText}</p>
      <dl class="ad-kv">
        ${kv("Home", "Public clips that are ready for discovery.")}
        ${kv("Unlisted", "Shareable by link, but not listed on Home.")}
        ${kv("Private", "Visible only to the clip owner.")}
        ${kv("Media", "Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`;
}
