const MARKER_EPSILON_S = 0.05;

const MARKER_CATEGORIES = {
  ChampionKill: "kill",
  FirstBlood: "kill",
  Multikill: "spree",
  Ace: "spree",
  DragonKill: "objective",
  HeraldKill: "objective",
  BaronKill: "objective",
  TurretKilled: "structure",
  InhibKilled: "structure",
  FirstBrick: "structure",
};

export function secondsFromMilliseconds(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number / 1000 : 0;
}

export function clampTime(value, duration) {
  const time = Number.isFinite(value) ? value : 0;
  const max = duration > 0 ? duration : Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.min(max, time));
}

export function percentFor(time, duration) {
  if (!(duration > 0)) {
    return 0;
  }
  return Math.max(0, Math.min(100, (time / duration) * 100));
}

export function formatClock(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total - minutes * 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function formatClockTenths(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00.0";
  }
  const tenths = Math.max(0, Math.round(seconds * 10));
  const minutes = Math.floor(tenths / 600);
  const rest = tenths - minutes * 600;
  const wholeSeconds = Math.floor(rest / 10);
  return `${minutes}:${String(wholeSeconds).padStart(2, "0")}.${rest % 10}`;
}

export function formatReadout(current, duration) {
  return `${formatClockTenths(current)} / ${duration > 0 ? formatClockTenths(duration) : "0:00.0"}`;
}

export function markerCategory(kind) {
  return MARKER_CATEGORIES[kind] || "info";
}

export function normalizeMarkers(markers, duration) {
  return (markers || [])
    .map((marker, index) => {
      const timestampMs = Number(marker.timestamp_ms);
      if (!Number.isFinite(timestampMs)) {
        return null;
      }
      const time = timestampMs / 1000;
      if (time < 0 || (duration > 0 && time > duration)) {
        return null;
      }
      return {
        index,
        time,
        kind: String(marker.kind || "Marker"),
        label: String(marker.label || marker.kind || "Marker"),
        category: markerCategory(marker.kind),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);
}

export function markerSummary(markers) {
  if (!markers.length) {
    return "No markers";
  }
  return markers.length === 1 ? "1 marker" : `${markers.length} markers`;
}

export function nextMarker(markers, currentTime) {
  if (!markers.length) {
    return null;
  }
  for (const marker of markers) {
    if (marker.time > currentTime + MARKER_EPSILON_S) {
      return marker;
    }
  }
  return markers[0];
}

export function previousMarker(markers, currentTime) {
  if (!markers.length) {
    return null;
  }
  for (let index = markers.length - 1; index >= 0; index -= 1) {
    if (markers[index].time < currentTime - MARKER_EPSILON_S) {
      return markers[index];
    }
  }
  return markers[markers.length - 1];
}

export function playerKeyIntent(code, shiftKey) {
  switch (code) {
    case "Space":
    case "KeyK":
      return { kind: "toggle-play" };
    case "ArrowLeft":
      return { kind: "seek-by", seconds: shiftKey ? -1 : -5 };
    case "ArrowRight":
      return { kind: "seek-by", seconds: shiftKey ? 1 : 5 };
    case "KeyJ":
      return { kind: "seek-by", seconds: -10 };
    case "KeyL":
      return { kind: "seek-by", seconds: 10 };
    case "Comma":
      return { kind: "seek-by", seconds: -0.1 };
    case "Period":
      return { kind: "seek-by", seconds: 0.1 };
    case "KeyM":
      return { kind: shiftKey ? "previous-marker" : "next-marker" };
    case "Home":
      return { kind: "seek-to", seconds: 0 };
    case "End":
      return { kind: "seek-to-end" };
    case "KeyF":
      return { kind: "fullscreen" };
    default:
      return null;
  }
}
