// Formatters ported verbatim from ../app.js:3640-3706 (output strings must not change).

export function formatDate(value) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDuration(value) {
  if (value == null) {
    return "Unknown";
  }
  const totalSeconds = Math.max(0, Math.round(Number(value) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatRelativeTime(value) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  const diffMs = Math.min(0, date.getTime() - Date.now());
  const units = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["week", 7 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
  ];
  const [unit, unitMs] =
    units.find(([, size]) => Math.abs(diffMs) >= size) || units[units.length - 1];
  const amount = Math.round(diffMs / unitMs);
  return new Intl.RelativeTimeFormat(undefined, { numeric: "always" }).format(amount, unit);
}

export function formatBytes(value) {
  if (value == null) {
    return "Unknown";
  }
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) {
    return "Unknown";
  }
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let amount = bytes;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatViews(value) {
  const views = Number(value || 0);
  const safeViews = Number.isFinite(views) && views > 0 ? Math.floor(views) : 0;
  const formatted = new Intl.NumberFormat(undefined, { notation: safeViews >= 10000 ? "compact" : "standard" }).format(safeViews);
  return `${formatted} view${safeViews === 1 ? "" : "s"}`;
}
