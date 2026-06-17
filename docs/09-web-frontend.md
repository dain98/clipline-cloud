# 09 — Web Frontend

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** docs 04 (auth), 07 (clips API), 08 (media/public), 06 (dead-jobs for admin)
**Design sections:** §17 (frontend), §16 (the APIs it consumes), §22/Appendix A (admin/privacy boundary)

> Goal: the four-area web app — Login, Library, Clip detail, Admin — built as static assets served by
> the backend (doc 01). Consumes the cookie-session auth and clip/media/public APIs. Thumbnails are
> Phase-2, so the library renders **placeholders** intentionally.

---

## Goal

`clipline-cloud-web`: a frontend (React / SvelteKit / Solid / plain Vite + Tailwind, HTML5 `<video>`)
covering login, the owner's library with sort/filter, clip detail with markers and visibility
control, and the admin area — all behind the cookie session + CSRF model from doc 04.

## Design context (§17)

Four areas.

**Login** — username/password, clear errors, **no self-registration** unless an admin enables it
(omitted from v1).

**Library** — the owner's clips, with sort (newest/oldest, game, recorded/uploaded date, duration)
and filters (game, visibility, status). Fields: thumbnail, title, game, duration, recorded date,
upload date, visibility badge, file size. Actions: view, copy link, toggle public/private, delete.

> *Phase-1 note: thumbnails are generated in Phase 2 (doc 12), so the Phase-1 library renders
> placeholders — intentional.*

**Clip detail** — player, title, game, recorded date, duration, markers (League markers as timeline
ticks), visibility control, public URL when public, metadata, delete.

**Admin** — create/disable user, reset password, list users, per-user storage usage, active
sessions/device tokens, server version + config summary, failed uploads, dead jobs, optional
per-user quotas.

> Admins manage accounts and infrastructure but get **no casual "view everyone's private clips" UI**
> (§22 / Appendix A). Honor that boundary in the UI — there is no "browse all clips" admin screen.

### Notes on what's Phase-1 vs later

- Per-user storage usage/quotas, advanced sort/search, game grouping, bulk operations, and rich
  session/device-token management screens are **Phase 3 polish** (doc 13). Phase-1 admin shows the
  basics (create/disable user, reset password, list users, server version/config, failed uploads,
  dead jobs).
- Richer upload progress in the web UI is **Phase 2** (doc 12).

## Implementation checklist

- [x] Frontend project scaffolded in `apps/clipline-cloud-web`; build output served by the backend (doc 01)
- [x] **Login** page: username/password, clear errors; respects cookie-session + CSRF (doc 04); no self-registration
- [x] **Library** view: lists owner clips with the documented sort + filters; shows the listed fields; placeholder thumbnails
- [x] Library actions: view, copy link, toggle public/private, delete (wired to doc 07/08 endpoints)
- [x] **Clip detail**: HTML5 `<video>` player with range-based seeking; title/game/date/duration/metadata
- [x] Clip detail: markers rendered as timeline ticks; visibility control; public URL shown when public
- [x] **Admin (Phase-1 scope)**: create/disable user, reset password (with re-auth, doc 04), list users
- [x] Admin: server version + config summary, failed uploads, dead jobs (doc 06)
- [x] No "view all users' private clips" screen anywhere (privacy boundary)
- [x] CSRF token sent on every state-changing request; `Origin`/`Referer` consistent with doc 04

## Definition of done

- [x] A user logs in, sees their library, sorts/filters it, opens a clip, and plays it with working seek
- [x] Toggling public shows a copyable share link; the public page (doc 08) opens without login
- [x] An admin creates/disables a user and resets a password (re-auth enforced) entirely from the UI
- [x] Failed uploads and dead jobs are visible to the admin
- [x] No UI path exposes another user's private clips

## Progress log

- 2026-06-16 — Built a dependency-free static SPA scaffold under `apps/clipline-cloud-web/src`
  with a Node build script that writes `dist`, then wired the backend to serve SPA deep links
  (`/`, `/login`, `/admin`, `/clip/...`, `/c/...`) with `index.html`.
- 2026-06-16 — Implemented login, owner library sort/filter/action controls, clip detail playback
  with marker ticks and metadata editing, anonymous public share pages, and Phase-1 admin screens
  for users, reset tokens, server/config summary, failed uploads, dead jobs, and recent job errors.
- 2026-06-16 — Added read-only admin overview and failed-upload API endpoints used by the UI,
  without adding any cross-user private clip browsing surface.
- 2026-06-16 — Verified with `npm run build`, `node --check`, `cargo fmt --all --check`,
  `cargo test --workspace`, `cargo build --workspace`, and a local HTTP smoke covering static
  frontend routes, cookie-session + CSRF auth, admin user create/reset/disable, upload-to-library,
  clip detail media range, public share route, diagnostics endpoints, and revoke-to-404.
- 2026-06-17 — YouTube-style redesign applied (Tasks 1–15). Summary:
  - **Architecture (T1):** ES module split — `app.js` / `router.js` / `shell.js` / `util.js` / per-view modules under `js/views/`, shared components under `js/components/`.
  - **Design tokens + base CSS (T2):** dark-first token sheet (`css/tokens.css`), reset + typography in `css/base.css`. All colours, spacing, radius, and typography driven by custom properties.
  - **App shell (T3):** fixed top header with wordmark, search pill, account avatar/menu; collapsible guide rail (240 → 72 px mini → off-canvas drawer on mobile); `renderShell()` owns the persistent DOM, views mount into `.app-content`.
  - **Login restyle (T4):** centred `.auth-card` on dark background, matching the new token palette.
  - **Backend `has_thumbnail` (T5):** new field on the public clip JSON response (added via TDD — backend unit + integration tests green).
  - **Card component (T6):** `.card` / `.thumb` / `.card-body` / `.card-kebab` composable; dark thumbnail placeholder with play-glyph hover; skeleton cards for loading state.
  - **Library grid (T7):** `css/components.css` `.clip-grid` auto-fill columns; chip bar with sticky scroll, visibility/status/sort chips; collapsible filters panel (`.filters-panel`); empty and error states.
  - **Marker timeline component (T8):** `.marker-bar` + `.tick` buttons wired to `video.currentTime`; `bindMarkerTimeline()` updates ticks on `timeupdate`; accessible (keyboard seek, focus ring).
  - **Watch view (T9):** two-column `.watch-layout` (player+detail | up-next rail), collapsing to single column ≤ 1000 px; `.description-card` with `<details>` collapse; `.marker-section` chapter list; visibility chip actions (publish/revoke/delete) with confirm flow; `has_thumbnail` drives live thumbnail.
  - **Up-next rail (T10):** `partitionUpNext()` sorts remaining clips into a `.up-next` aside; `.up-next-card` horizontal compact variant with `.thumb--sm`.
  - **Backend public markers (T11):** `GET /api/v1/public/clips/{share_id}` now returns `markers: [{kind, label, timestamp_ms}]` and `has_thumbnail: bool` (TDD).
  - **Public watch view (T12):** anonymous `.public-shell` with brand topbar; marker bar + chapter list; no owner metadata, no edit controls; public copy banner states playback is not DRM-protected.
  - **Admin Studio (T13):** YouTube-Studio-style underline tab bar (`.studio-tabs`); Overview tab with `.metric-grid` stat cards; Users tab with `.admin-grid` (form + table); Jobs tab with `.job-list`; no cross-user clip browsing.
  - **Responsive + a11y (T14):** guide rail goes off-canvas at ≤ 1000 px with scrim + hamburger; search pill collapses to icon; watch layout single-column at ≤ 900 px; admin grid stacks at ≤ 900 px; skip-nav link; `aria-label` on icon-only controls; `prefers-reduced-motion` disables skeleton shimmer; focus-visible rings on all interactive elements; `.badge-private` / `.badge-unlisted` use text-muted contrast-safe colours.
  - **Cleanup (T15):** deleted legacy `src/styles.css` and its `<link>`; migrated `.badge-private`, `.badge-unlisted`, `.brand-mark`, `.boot-screen`, `.app-root` to canonical CSS files; removed dead `navLink()` export from `shell.js`; removed legacy variable alias block from `tokens.css`.
