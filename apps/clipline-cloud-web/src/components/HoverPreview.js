import { html } from "../lib/html.js";
import { useRef, useState } from "preact/hooks";

let activeTeardown = null;
const canPreview = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !navigator.connection?.saveData;

export function HoverPreview({ src, poster, alt = "" }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const videoRef = useRef(null);

  const stop = () => {
    clearTimeout(timer.current);
    setPlaying(false);
    setProgress(0);
    activeTeardown = null;
  };
  const onEnter = () => {
    if (!src || !canPreview()) return;
    timer.current = setTimeout(() => {
      activeTeardown?.();
      activeTeardown = stop;
      setPlaying(true);
    }, 300);
  };
  const onTime = (e) => {
    const v = e.target;
    if (v.duration) setProgress(v.currentTime / v.duration);
  };

  return html`<span class="hover-preview" onPointerEnter=${onEnter} onPointerLeave=${stop}>
    ${playing
      ? html`<video ref=${videoRef} src=${src} poster=${poster} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${onTime} />`
      : html`<img src=${poster} alt=${alt} loading="lazy" />`}
    ${playing && html`<span class="preview-scrub"><span style=${`width:${progress * 100}%`} /></span>`}
  </span>`;
}
