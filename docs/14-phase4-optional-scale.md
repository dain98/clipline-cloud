# 14 — Phase 4: Optional Scale

**Phase:** Phase 4 (post-v1, build only if demand appears)
**Status:** ◐ In progress
**Depends on:** Phase 1 complete (docs 01–11); doc 06 (job claiming was designed for the worker split); doc 05 (upload protocol)
**Design sections:** §30 Phase 4, §12 (direct-to-S3 future), §7 (worker-split safety)

> Goal: the optional scaling and integration features. **Build only if demand appears** — none of
> this is needed for a working self-hosted instance. Several items were explicitly designed-for
> earlier (the durable-job claim mechanism already makes the worker split schema-free), so they slot
> in cleanly.

---

## Goal

Direct-to-S3 multipart via presigned part URLs; a dedicated worker container; transcoding / multiple
qualities; a CDN for public clips; invite links; OIDC; federation.

## Design context (§30 Phase 4)

Direct-to-S3 multipart via presigned part URLs; dedicated worker container; transcoding/multiple
qualities; CDN for public clips; invite links; OIDC; federation. **Build only if demand appears.**

Notes from earlier design decisions that make these cheaper:

- **Direct-to-S3 multipart** (§12): a future version can let the client upload parts straight to S3
  via presigned part URLs, with the backend only orchestrating — or adopt TUS. The first-party
  protocol (doc 05) was kept deliberately so v1 keeps tight control over the desktop UX; this is the
  step that trades that for offloaded bandwidth.
- **Dedicated worker container** (§7): the durable-job **claim mechanism** (atomic `UPDATE ...
  RETURNING` + `locked_by`/`locked_at` + stale-lock requeue, doc 06) was built so the worker split is
  **safe with no schema change.** A second process just becomes another `locked_by` runner.
- **CDN for public clips**: extends the presigned/proxy public-media path (doc 08).
- **OIDC / invite links / federation**: all explicitly **out of scope for v1** (§2); revisit here.
- **Transcoding / multiple qualities**: §13 commits to *no* server-side transcoding in v1; this is
  where multi-resolution would be added, riding the same job runner.

## Implementation checklist (activate items only when demanded)

- [ ] Direct-to-S3 multipart via presigned part URLs (backend orchestrates; client PUTs to S3) — or TUS
- [x] Dedicated worker container as an additional job runner (no schema change; relies on doc-06 claiming)
- [ ] Server-side transcoding to multiple qualities (new job kinds on the runner)
- [ ] CDN in front of public clips (extends doc-08 public-media path)
- [ ] Invite links (self-service onboarding without full self-registration)
- [ ] OIDC login (Discord/Google/Steam)
- [ ] Federation

## Definition of done

- [ ] Per shipped item: it works end to end, is documented, and degrades gracefully when disabled
- [x] The dedicated worker (if shipped) coexists with the in-process runner without double-processing jobs
- [x] No Phase-4 feature is enabled by default that would compromise the v1 self-hosted simplicity guarantee

## Progress log

- 2026-06-17: Added `CLIPLINE_PROCESS_ROLE=all|web|worker` plus optional Compose
  `clipline-worker` services. The default remains the single combined process; split deployments
  set the web container to `web` and enable the worker profile so job processing runs in a separate
  container against the same database/storage state.
