import { html } from "../lib/html.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { icon } from "../lib/icons.js";
import {
  clampTime,
  formatClock,
  formatReadout,
  nextMarker,
  normalizeMarkers,
  percentFor,
  playerKeyIntent,
  previousMarker,
  secondsFromMilliseconds,
} from "../player-core.js";

const VOLUME_KEY = "clipline.playerVolume";
const THEATER_KEY = "clipline.clipTheaterMode";
const IDLE_HIDE_MS = 2000;
const RATE_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

// Keyboard shortcuts layered on top of player-core's playerKeyIntent per the
// approved watch-page spec (docs/superpowers/specs/2026-07-03-web-ui-redesign-design.md
// §4.3): M now mutes (player-core reserves M for marker-jump, which the new
// chrome exposes as dedicated prev/next buttons instead), F now toggles
// theater (player-core maps F to fullscreen, which stays button-only), and
// Escape exits theater (unhandled by player-core). Everything else — space/K
// play, arrow/J/L seek, Home/End, comma/period, T theater — still delegates
// to player-core unchanged.
export function resolvePlayerKeyIntent(code, shiftKey) {
  switch (code) {
    case "KeyM":
      return { kind: "toggle-mute" };
    case "KeyF":
      return { kind: "theater" };
    case "Escape":
      return { kind: "exit-theater" };
    default:
      return playerKeyIntent(code, shiftKey);
  }
}

// The keyboard listener is global, so shortcuts must not fire while the user
// is typing or interacting with another control.
function isPlayerShortcutBlockedTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"));
}

export function readStoredVolume() {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    // Number(null) is zero, so check absence before parsing to avoid muting
    // first-time visitors.
    if (raw == null) return 1;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
  } catch {
    return 1;
  }
}

function writeStoredVolume(value) {
  try {
    window.localStorage.setItem(VOLUME_KEY, String(Math.max(0, Math.min(1, value))));
  } catch {
    // Playback still works if storage is unavailable.
  }
}

function readStoredTheater() {
  try {
    return window.localStorage.getItem(THEATER_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredTheater(value) {
  try {
    window.localStorage.setItem(THEATER_KEY, String(value));
  } catch {
    // Layout still updates if storage is unavailable.
  }
}

export function Player({ src, poster, durationMs, markers }) {
  const videoRef = useRef(null);
  const rootRef = useRef(null);
  const hideTimerRef = useRef(null);
  const scrubbingRef = useRef(false);
  const resumeAfterScrubRef = useRef(false);

  const fallbackDuration = secondsFromMilliseconds(durationMs);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [bufferedPct, setBufferedPct] = useState(0);
  const [volume, setVolume] = useState(readStoredVolume);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [rateOpen, setRateOpen] = useState(false);
  const [theater, setTheater] = useState(readStoredTheater);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [hover, setHover] = useState(null);
  const [note, setNote] = useState("");

  const normalizedMarkers = normalizeMarkers(markers, duration);

  function wake() {
    setChromeVisible(true);
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended) {
        setChromeVisible(false);
      }
    }, IDLE_HIDE_MS);
  }

  // Whenever playback pauses/ends, always show chrome and stop the idle timer.
  useEffect(() => {
    if (!playing) {
      window.clearTimeout(hideTimerRef.current);
      setChromeVisible(true);
    }
  }, [playing]);

  // Keep Preact state synchronized with the native media element.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const resolveDuration = () =>
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackDuration;

    const onLoadedMetadata = () => setDuration(resolveDuration());
    const onDurationChange = () => setDuration(resolveDuration());
    const onTimeUpdate = () => {
      if (!scrubbingRef.current) setCurrentTime(video.currentTime || 0);
    };
    const onProgress = () => {
      const total = resolveDuration();
      if (!(total > 0) || !video.buffered?.length) {
        setBufferedPct(0);
        return;
      }
      const current = video.currentTime || 0;
      let end = 0;
      for (let index = 0; index < video.buffered.length; index += 1) {
        const start = video.buffered.start(index);
        const rangeEnd = video.buffered.end(index);
        if (current >= start && current <= rangeEnd) {
          end = rangeEnd;
          break;
        }
        end = Math.max(end, rangeEnd);
      }
      setBufferedPct(percentFor(end, total));
    };
    const onPlay = () => {
      setPlaying(true);
      setNote("");
      wake();
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted || video.volume === 0);
    };
    const onError = () => setNote("Playback unavailable");

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("progress", onProgress);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fallbackDuration]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);

  // Start playback when a clip loads; fall back to muted if the browser blocks
  // autoplay with sound (common on first visit before any user gesture).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let cancelled = false;

    async function startPlayback() {
      if (cancelled) return;
      try {
        await video.play();
        return;
      } catch {
        if (cancelled || !video.paused) return;
        video.muted = true;
        setMuted(true);
        try {
          await video.play();
        } catch (error) {
          setNote(error?.message || "Playback unavailable");
        }
      }
    }

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback();
    } else {
      video.addEventListener("canplay", startPlayback, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", startPlayback);
    };
  }, [src]);

  // Theater mode: class on <html> so the watch page can become a wide
  // in-page stage while leaving the surrounding page scrollable.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("clipline-theater", theater);
    return () => root.classList.remove("clipline-theater");
  }, [theater]);

  function setTheaterMode(next) {
    setTheater(next);
    writeStoredTheater(next);
  }

  function seekTo(time) {
    const video = videoRef.current;
    if (!video) return;
    const target = duration > 0 ? clampTime(time, duration) : Math.max(0, time);
    video.currentTime = target;
    setCurrentTime(target);
  }

  function seekBy(delta) {
    seekTo((videoRef.current?.currentTime || 0) + delta);
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch (error) {
        setNote(error?.message || "Playback failed");
      }
    } else {
      video.pause();
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) {
        video.volume = 1;
        setVolume(1);
        writeStoredVolume(1);
      }
      setMuted(false);
    } else {
      video.muted = true;
      setMuted(true);
    }
  }

  function onVolumeInput(event) {
    const value = Number(event.target.value);
    setVolume(value);
    setMuted(value === 0);
    writeStoredVolume(value);
    const video = videoRef.current;
    if (video) {
      video.volume = value;
      video.muted = value === 0;
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen?.();
      }
    } catch (error) {
      setNote(error?.message || "Fullscreen unavailable");
    }
  }

  function jumpMarker(direction) {
    const current = videoRef.current?.currentTime || 0;
    const marker = direction > 0 ? nextMarker(normalizedMarkers, current) : previousMarker(normalizedMarkers, current);
    if (marker) seekTo(marker.time);
  }

  function onScrubPointerDown() {
    scrubbingRef.current = true;
    resumeAfterScrubRef.current = playing;
    if (playing) videoRef.current?.pause();
  }
  function onScrubInput(event) {
    const value = Number(event.target.value);
    setCurrentTime(value);
    seekTo(value);
  }
  function endScrub() {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    if (resumeAfterScrubRef.current) {
      resumeAfterScrubRef.current = false;
      videoRef.current?.play().catch(() => {});
    }
  }

  function onTimelineHover(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!(rect.width > 0)) return;
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setHover({ pct: pct * 100, time: pct * (duration || 0) });
  }
  function onTimelineLeave() {
    setHover(null);
  }

  // Global keyboard shortcuts are active only while this player is mounted.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || isPlayerShortcutBlockedTarget(event.target)) return;
      const intent = resolvePlayerKeyIntent(event.code, event.shiftKey);
      if (!intent) return;
      if (intent.kind === "exit-theater" && !theater) return;
      event.preventDefault();
      wake();
      switch (intent.kind) {
        case "toggle-play":
          togglePlay();
          break;
        case "seek-by":
          seekBy(intent.seconds);
          break;
        case "seek-to":
          seekTo(intent.seconds);
          break;
        case "seek-to-end":
          seekTo(duration);
          break;
        case "next-marker":
          jumpMarker(1);
          break;
        case "previous-marker":
          jumpMarker(-1);
          break;
        case "toggle-mute":
          toggleMute();
          break;
        case "theater":
          setTheaterMode(!theater);
          break;
        case "exit-theater":
          setTheaterMode(false);
          break;
        case "fullscreen":
          toggleFullscreen();
          break;
        default:
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, theater, playing]);

  return html`<div class=${`player ${chromeVisible ? "" : "chrome-hidden"}`} ref=${rootRef}
      onPointerMove=${wake} onPointerEnter=${wake}
      onPointerLeave=${() => { const v = videoRef.current; if (v && !v.paused) setChromeVisible(false); }}
      onFocusIn=${() => setChromeVisible(true)}>
    <video ref=${videoRef} class="player-video" src=${src} poster=${poster || undefined}
      preload="metadata" playsinline onClick=${togglePlay}></video>
    ${note && html`<div class="player-note">${note}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${onTimelineHover} onPointerLeave=${onTimelineLeave}>
        <div class="player-buffered" style=${`width:${bufferedPct}%`}></div>
        <div class="player-progress" style=${`width:${percentFor(currentTime, duration)}%`}></div>
        ${normalizedMarkers.map(
          (marker) => html`<span class="player-marker-tick" key=${marker.index}
            style=${`left:${percentFor(marker.time, duration)}%`} title=${`${marker.label} @ ${formatClock(marker.time)}`}></span>`
        )}
        <input class="player-scrubber" type="range" min="0" max=${duration > 0 ? duration : 0} step="0.01"
          value=${currentTime} disabled=${!(duration > 0)} aria-label="Seek"
          onPointerDown=${onScrubPointerDown} onInput=${onScrubInput} onChange=${endScrub}
          onPointerUp=${endScrub} onPointerCancel=${endScrub} onLostPointerCapture=${endScrub} />
        ${hover && html`<div class="player-hover-time" style=${`left:${hover.pct}%`}>${formatClock(hover.time)}</div>`}
      </div>
      <div class="player-controls">
        ${normalizedMarkers.length > 0 && html`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${() => jumpMarker(-1)}>${icon("skipBack", { size: 14 })}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${() => jumpMarker(1)}>${icon("skipForward", { size: 14 })}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${playing ? "Pause" : "Play"} onClick=${togglePlay}>
          ${icon(playing ? "pause" : "play", { size: 16 })}
        </button>
        <span class="player-time">${formatReadout(currentTime, duration)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${rateOpen}
            onClick=${() => setRateOpen((open) => !open)}>${rate}×</button>
          ${rateOpen && html`<div class="player-speed-menu" role="menu">
            ${RATE_OPTIONS.map(
              (option) => html`<button type="button" role="menuitem" key=${option}
                class=${`player-speed-item ${option === rate ? "is-active" : ""}`}
                onClick=${() => { setRate(option); setRateOpen(false); }}>${option}×</button>`
            )}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${muted ? "Unmute" : "Mute"} onClick=${toggleMute}>
          ${icon(muted ? "volumeX" : "volume2", { size: 14 })}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${muted ? 0 : volume}
          aria-label="Volume" onInput=${onVolumeInput} />
        <button type="button" class="player-btn" aria-label=${theater ? "Exit theater mode" : "Theater mode"}
          aria-pressed=${theater} onClick=${() => setTheaterMode(!theater)}>${icon("theater", { size: 14 })}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${toggleFullscreen}>
          ${icon("fullscreen", { size: 14 })}
        </button>
      </div>
    </div>
  </div>`;
}
