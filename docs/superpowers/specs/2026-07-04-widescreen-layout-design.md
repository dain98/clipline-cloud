# Wide-screen layout scaling — design

Date: 2026-07-04
Scope: `apps/clipline-cloud-web/src/ui.css` only (plus rebuilt `dist/`).

## Problem

Every page shares `.ui .page { max-width: 1200px }` and the clip card grid is
hard-coded to 4 columns, stepping only down (4 → 2 → 1). On large windows
(≥1600px) roughly half the viewport is empty margin. Small-window rendering is
good and must not regress.

## Direction (agreed)

More content on wide screens, not bigger content and not fully fluid: raise the
page cap and let grids gain columns. Watch player scales with the page but is
height-guarded. Grids use CSS auto-fill rather than new explicit breakpoints.

## Changes

1. **Page shell** — `.ui .page` max-width 1200px → **1720px**. Padding
   unchanged. Widens feed, library, games, profile, user, and watch at once.
   A soft cap is kept so ultrawide monitors don't produce 8+ column grids.

2. **Card grids** — `.ui .card-grid` becomes
   `repeat(auto-fill, minmax(250px, 1fr))`; the 1100px and 640px grid
   step-down media queries are deleted. Yields ~4 columns at 1200px (as
   today), 5–6 at 1600–1920px, and 1–2 on small screens automatically. Also
   removes the jarring 4 → 2 jump at 1100px.

3. **Feed hero** — at ≥1500px, `.ui .hero-row img` width 104px → 160px so the
   side column keeps its proportions next to the taller main image.

4. **Watch player (non-theater)** — add `max-height: 72vh` to `.ui .player` so
   a 1720px-wide player can't push title/comments below the fold on
   short-and-wide windows; the video letterboxes via its existing
   `object-fit: contain`. Theater mode explicitly resets this
   (`max-height: none`) because it computes its own stage height.

5. **Theater metadata** — the `max-width: 1200px` on the theater title row and
   up-next strip becomes 1720px to line up with the new page cap.

## Deliberately unchanged

Admin settings (62rem), account grid, about, login, and public-user bio keep
their tighter caps — forms and prose shouldn't stretch. Top bar is already
full-width. Mobile/tablet rendering is identical apart from the auto-fill
grid, which behaves equivalently at those sizes.

## Verification

Playwright screenshots of feed, library, and watch (normal + theater) at
1280, 1720, and 2560px wide; 640px spot-check for mobile regressions.
