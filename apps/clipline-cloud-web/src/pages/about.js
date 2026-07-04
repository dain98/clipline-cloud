import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";

const DEFAULT_ABOUT_TEXT = "Clipline is a self-hosted clip library for saved gameplay moments.";

function kv(label, value) {
  return html`<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

export function AboutPage() {
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_TEXT);

  useEffect(() => {
    let live = true;
    api("/api/v1/about")
      .then((data) => live && setAboutText(data.about_text || DEFAULT_ABOUT_TEXT))
      // The about text is decorative copy on a public page — fall back to
      // the default silently rather than surfacing a toast for it.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

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
