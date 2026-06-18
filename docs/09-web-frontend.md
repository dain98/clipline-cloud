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

**Public** — the main homepage at `/` (with `/public` kept as an alias) for anonymous and signed-in
discovery of clips explicitly marked public. It supports search, game filtering, sorting, and links
into the public share page. Unlisted clips do not appear.

**Library** — the authenticated owner's clips at `/library`, with sort (newest/oldest, game,
recorded/uploaded date, duration) and filters (game, visibility, status). Fields: thumbnail, title,
game, duration, recorded date, upload date, visibility badge, file size. Actions: view, copy link,
toggle public/private, delete.

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
- [x] `/` and `/public` render public discovery; `/library` renders the owner library after auth
- [x] **Library** view: lists owner clips with the documented sort + filters; shows the listed fields; placeholder thumbnails
- [x] Library actions: view, copy link, toggle public/private, delete (wired to doc 07/08 endpoints)
- [x] **Public** view: lists anonymous discoverable public clips without owner/edit controls
- [x] **Clip detail**: HTML5 `<video>` player with range-based seeking; title/game/date/duration/metadata
- [x] Clip detail: markers rendered as timeline ticks; visibility control; public URL shown when public
- [x] **Admin (Phase-1 scope)**: create/disable user, reset password (with re-auth, doc 04), list users
- [x] Admin: server version + config summary, failed uploads, dead jobs (doc 06)
- [x] No "view all users' private clips" screen anywhere (privacy boundary)
- [x] CSRF token sent on every state-changing request; `Origin`/`Referer` consistent with doc 04

## Definition of done

- [x] A user logs in, sees `/library`, sorts/filters it, opens a clip, and plays it with working seek
- [x] Toggling public shows a copyable share link; the public page (doc 08) opens without login
- [x] Public clips appear on `/` and `/public`; unlisted/private clips do not
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
