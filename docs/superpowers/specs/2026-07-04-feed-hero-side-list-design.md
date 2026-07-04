# Feed hero side list — design

**Date:** 2026-07-04
**Status:** approved (option A of three rendered variants)

## Problem

On the public feed's default view, the three clips beside the featured clip
(`renderHero` in `apps/clipline-cloud-web/src/pages/feed.js`) each get
`flex: 1`, stretching three ~58px-tall rows across the featured clip's full
height (~441px at a 1440px window). The thumbnail stays a fixed 104px wide, so
the leftover height turns into large, awkward vertical gaps between rows.

## Decision

Make the three side rows fill the hero column deliberately: scale the
thumbnails so three rows sum to exactly the featured clip's height at every
window width, and give the row content matching polish.

## Changes

All in `apps/clipline-cloud-web` (plus rebuilt `dist/`).

### Sizing (ui.css, hero block)

- Replace the fixed side-thumbnail width with
  `width: clamp(144px, 19.1vw - 32px, 300px)`.
  The formula derives from the hero geometry: 1.6fr/1fr columns with an 18px
  column gap, 16:8.4 hero aspect ratio, `.page` horizontal padding (28px × 2)
  and its 1720px max-width, and a 12px row gap. Three rows then match the
  hero-main height across 900px–1720px viewports; the 300px cap holds the size
  where `.page` stops growing.
- Row and side-list gaps become 12px.
- `.hero-row` keeps `flex: 1` solely to absorb ±2px rounding drift.
- Delete the `@media (min-width: 1500px)` override (`.hero-row img { width:
  160px; }`) — the clamp covers it.
- The `max-width: 900px` stacked layout is unchanged (its `width: 100%`
  override still wins over the base rule).

### Polish

- **Duration pill:** wrap the side row `img` in `<span class="hero-thumb">`
  (`position: relative; flex-shrink: 0`) and add the existing `.dur-pill`
  element with `formatDuration(clip.duration_ms)`, matching the clip cards
  below. The clamp width moves to `.hero-thumb`; the img fills it.
- **Hover state:** on `.hero-row:hover`, the title (`b`) shifts to
  `var(--accent)`, consistent with the app's link affordances.
- Title font size 13px → 13.5px; meta line 11px → 11.5px.

## Non-goals

- No API or data changes; still the first clip featured plus the next three.
- No change to the featured clip itself, the card grid, or the sub-900px
  stacked layout beyond inheriting the markup wrap.

## Verification

- All existing web tests pass (`npm test` in `apps/clipline-cloud-web`);
  `npm run build` + `check:dist` clean.
- Visual check in the running app with stubbed feed data at 1440px, 1720px+,
  ~950px, and a sub-900px width: side column height matches the featured clip
  (±2px) at the three wide sizes; stacked layout intact below 900px.
